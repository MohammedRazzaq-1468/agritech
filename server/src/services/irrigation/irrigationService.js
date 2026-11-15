import { executeStructuredGeminiPrompt } from '../gemini/geminiService.js';
import { irrigationAdvisoryResponseSchema } from '../../schemas/validation.js';
import { getLiveWeatherData } from '../weather/weatherService.js';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { logger } from '../../utils/logger.js';

const inMemoryIrrigationAdvisories = new Map();

export async function generateIrrigationAdvisory(userId, inputData) {
  const {
    cropName,
    growthStage,
    soilType,
    irrigationMethod,
    availableWater,
    recentRainfallMm,
    currentWeatherContext
  } = inputData;

  // Retrieve live weather context
  const weather = await getLiveWeatherData(null, null, 'Default');
  const temp = weather?.current?.temperature || 28;
  const humidity = weather?.current?.humidity || 55;
  const rainForecastNext3Days = (weather?.forecast?.slice(0, 3) || []).reduce((acc, f) => acc + (f.rainMm || 0), 0);

  const promptText = `
Formulate a precision irrigation advisory for an Indian farmer based on crop phenology, soil water dynamics, and live agrometeorological parameters.

FIELD & CROP METRICS:
- Crop: ${cropName}
- Current Phenological Stage: ${growthStage} (e.g., vegetative, flowering, grain-filling)
- Soil Type: ${soilType} (affects infiltration rate and water-holding capacity)
- Irrigation Method Installed: ${irrigationMethod} (drip, sprinkler, furrow/flood, basin)
- Water Resource Availability: ${availableWater}
- Recent Rainfall (Past 48 Hours): ${recentRainfallMm || 0} mm
- Weather Context: Current Temp ${temp}°C, Humidity ${humidity}%, Expected 72hr Rain ${rainForecastNext3Days.toFixed(1)} mm. ${currentWeatherContext || ''}

PRECISION WATER MANAGEMENT PRINCIPLES:
1. Soil Texture Dynamics: Sandy soils require frequent, smaller water volumes; clay/black soils hold high moisture but are prone to waterlogging and root rot if over-irrigated.
2. Critical Growth Stages: Flowering and fruit/grain development are moisture-sensitive stages where stress causes severe flower drop or poor grain filling.
3. Rain-delay logic: If recent or imminent forecast rainfall exceeds crop evapotranspiration, recommend pausing scheduled irrigation.
4. Avoid inventing unsupported mathematical schedules if essential metrics are absent; provide clear qualitative timings and operational indicators.
5. Return strictly JSON matching this structure:
{
  "summary": "Clear executive summary of irrigation requirement",
  "water_requirement_assessment": "Analysis of current crop evapotranspiration and soil moisture status",
  "irrigation_recommendation": "Specific actionable irrigation instruction for the next 48-72 hours",
  "best_practices": ["Best practice 1", "Best practice 2"],
  "weather_considerations": ["Consideration regarding temperature and forecast rain"],
  "water_conservation_methods": ["Drip emitter maintenance", "Mulching tips"],
  "missing_information": ["Soil moisture sensor reading if missing"],
  "limitations": ["Irrigation recommendations must adapt to actual on-farm soil feel and sudden showers."]
}
`;

  let aiResult = null;

  try {
    aiResult = await executeStructuredGeminiPrompt({
      promptText,
      zodSchema: irrigationAdvisoryResponseSchema
    });
  } catch (err) {
    logger.warn('Gemini irrigation advisory failed or unavailable, providing scientific fallback', err);
  }

  if (!aiResult) {
    const isCriticalStage = /flowering|fruit|pod|grain/i.test(growthStage);
    const hasRain = (recentRainfallMm || 0) > 15 || rainForecastNext3Days > 15;

    aiResult = {
      summary: hasRain
        ? `Sufficient soil moisture available from recent/forecast rain for ${cropName} in ${growthStage} stage. Pause routine irrigation.`
        : `Moderate water requirement for ${cropName} during ${growthStage} stage under ${soilType}.`,
      water_requirement_assessment: `The ${growthStage} stage is ${isCriticalStage ? 'critically sensitive' : 'moderately sensitive'} to moisture stress. In ${soilType}, water infiltration is balanced. Current ambient temperature (${temp}°C) drives moderate daily evapotranspiration.`,
      irrigation_recommendation: hasRain
        ? `Postpone scheduled irrigation for the next 48 hours. Check soil moisture 2 inches below surface before resuming.`
        : (irrigationMethod.toLowerCase().includes('drip')
            ? `Run drip irrigation for 45-60 minutes in the early morning (between 06:30 AM and 08:30 AM). Split across alternate days.`
            : `Apply light to moderate irrigation reaching the active root depth (approx 15-20 cm). Avoid water stagnation at the root collar.`),
      best_practices: [
        "Irrigate during cool morning or evening hours to minimize evaporative water loss.",
        "Perform the soil feel-and-appearance test: take soil from 15 cm depth; if it forms a ball without crumbling or releasing free water, moisture is adequate.",
        "Ensure field drainage channels are unobstructed to avoid waterlogging during unexpected heavy downpours."
      ],
      weather_considerations: [
        `Ambient temperature is ${temp}°C with ${humidity}% humidity.`,
        rainForecastNext3Days > 5
          ? `Rain probability detected over next 72 hours (${rainForecastNext3Days.toFixed(1)} mm). Hold off deep irrigation.`
          : 'Dry weather expected; maintain steady root zone moisture.'
      ],
      water_conservation_methods: [
        "Install organic straw mulch or black plastic mulch along plant beds to reduce soil surface evaporation by up to 35%.",
        "Inspect drip lateral pipes and flush end caps weekly to prevent emitter clogging from silt or carbonate scales."
      ],
      missing_information: [
        "Measured soil matric potential or tensiometer reading",
        "Exact emitter discharge rate (liters per hour)"
      ],
      limitations: [
        "Recommendation is a decision-support guide and should be adapted to real-time farm soil moisture and unexpected rains."
      ]
    };
  }

  let recordId = null;

  if (isSupabaseConfigured()) {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('irrigation_advisories')
        .insert({
          user_id: userId,
          crop_name: cropName,
          growth_stage: growthStage,
          soil_type: soilType,
          weather_data: { temp, humidity, rainForecastNext3Days },
          irrigation_recommendation: aiResult
        })
        .select('id, created_at')
        .single();

      if (!error && data) {
        recordId = data.id;
      } else {
        logger.error('Failed to insert irrigation advisory to Supabase', error);
      }
    } catch (e) {
      logger.error('Exception storing irrigation advisory', e);
    }
  }

  if (!recordId) {
    recordId = `irrig-${Date.now()}`;
    inMemoryIrrigationAdvisories.set(recordId, {
      id: recordId,
      user_id: userId,
      crop_name: cropName,
      growth_stage: growthStage,
      soil_type: soilType,
      weather_data: { temp, humidity, rainForecastNext3Days },
      irrigation_recommendation: aiResult,
      created_at: new Date().toISOString()
    });
  }

  return {
    id: recordId,
    cropName,
    ...aiResult
  };
}

export async function getUserIrrigationHistory(userId) {
  if (isSupabaseConfigured()) {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('irrigation_advisories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) return data || [];
  }

  return Array.from(inMemoryIrrigationAdvisories.values())
    .filter(a => a.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

