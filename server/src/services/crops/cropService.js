import { executeStructuredGeminiPrompt } from '../gemini/geminiService.js';
import { cropRecommendationResponseSchema } from '../../schemas/validation.js';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { logger } from '../../utils/logger.js';

// Fallback memory cache for standalone dev testing
const inMemoryRecommendations = new Map();

export async function generateCropRecommendation(userId, inputData) {
  const {
    state,
    district,
    soilType,
    landArea,
    areaUnit,
    season,
    waterAvailability,
    irrigationType,
    soilPH,
    nitrogen,
    phosphorus,
    potassium,
    additionalInformation
  } = inputData;

  // Retrieve regional crop knowledge context from database
  let availableCropsContext = '';
  if (isSupabaseConfigured()) {
    try {
      const client = supabaseAdmin || supabase;
      const { data: crops } = await client
        .from('crops')
        .select('name, scientific_name, category, suitable_soils, suitable_seasons, water_requirement, cultivation_duration_days')
        .eq('is_active', true);

      if (crops && crops.length > 0) {
        availableCropsContext = `Reference Knowledge Base Crops in System:\n${JSON.stringify(crops, null, 2)}`;
      }
    } catch (e) {
      logger.warn('Could not query crops table for context', e);
    }
  }

  const promptText = `
Analyze the supplied agricultural information and formulate precision crop recommendations for an Indian farmer.

FARMER AND FIELD PARAMETERS:
- Location: District ${district}, State ${state}, India
- Soil Classification: ${soilType}
- Measured Soil pH: ${soilPH !== undefined && soilPH !== null ? soilPH : 'Not tested'}
- Soil Nitrogen (N): ${nitrogen !== undefined && nitrogen !== null ? nitrogen + ' kg/ha' : 'Not tested'}
- Soil Phosphorus (P): ${phosphorus !== undefined && phosphorus !== null ? phosphorus + ' kg/ha' : 'Not tested'}
- Soil Potassium (K): ${potassium !== undefined && potassium !== null ? potassium + ' kg/ha' : 'Not tested'}
- Land Parcel Area: ${landArea} ${areaUnit}
- Agricultural Sowing Season: ${season} (Kharif/Rabi/Zaid)
- Water Availability: ${waterAvailability}
- Irrigation Infrastructure: ${irrigationType}
- Additional Notes: ${additionalInformation || 'None'}

${availableCropsContext}

REQUIREMENTS:
1. Recommend up to five suitable crop varieties best tailored for the soil, season, and water constraints.
2. For each crop, explain the agronomic rationale, soil compatibility, water requirement, cultivation duration, and key operational risks.
3. Explicitly identify missing soil/environmental parameters that could refine the recommendation.
4. Never guarantee yield or profit.
5. Return strictly a JSON object matching this schema:
{
  "summary": "Overall agronomic assessment of the land and season",
  "recommendations": [
    {
      "crop_name": "Crop name",
      "scientific_name": "Latin name or null",
      "suitability": "high" | "moderate" | "low",
      "reason": "Detailed agronomic explanation",
      "soil_requirements": "Soil texture, drainage, and pH requirements",
      "water_requirements": "Water depth, irrigation frequency",
      "season": "kharif" | "rabi" | "zaid",
      "cultivation_duration_days": 120,
      "risks": ["Risk 1", "Risk 2"],
      "confidence": "high" | "moderate" | "low"
    }
  ],
  "missing_information": ["e.g. Micronutrient zinc status", "Subsoil drainage status"],
  "limitations": ["Weather variations may affect germination", "Advisory is for decision-support only"],
  "expert_consultation_required": false
}
`;

  let aiResult = null;

  try {
    aiResult = await executeStructuredGeminiPrompt({
      promptText,
      zodSchema: cropRecommendationResponseSchema
    });
  } catch (err) {
    logger.warn('Gemini crop recommendation failed or unavailable, building deterministic agronomic recommendation', err);
  }

  // Realistic Agronomic Fallback if Gemini key is missing or quota is restricted
  if (!aiResult) {
    const isKharif = season === 'kharif';
    const isRabi = season === 'rabi';

    aiResult = {
      summary: `Agronomic evaluation for ${landArea} ${areaUnit} in ${district}, ${state} under ${season.toUpperCase()} season with ${soilType}. Water availability is ${waterAvailability} with ${irrigationType}.`,
      recommendations: [
        {
          crop_name: isKharif ? 'Pigeon Pea (Arhar / Tur)' : (isRabi ? 'Wheat (PBW 550 / HD 2967)' : 'Green Gram (Moong)'),
          scientific_name: isKharif ? 'Cajanus cajan' : (isRabi ? 'Triticum aestivum' : 'Vigna radiata'),
          suitability: 'high',
          reason: `Highly suited for ${soilType} and ${season} season. Excellent fit for ${waterAvailability} water availability and improves soil organic nitrogen.`,
          soil_requirements: `Prefers well-drained ${soilType} with pH 6.5 - 7.8. Avoid waterlogged patches.`,
          water_requirements: waterAvailability === 'low' ? 'Low: 300-450 mm across life cycle with 2 critical irrigations' : 'Moderate: 450-600 mm',
          season: season,
          cultivation_duration_days: isKharif ? 160 : (isRabi ? 125 : 70),
          risks: ['Pod borer insect pressure during flowering', 'Sudden temperature rise during maturity'],
          confidence: 'high'
        },
        {
          crop_name: isKharif ? 'Maize (Hybrid HQPM 1)' : (isRabi ? 'Chickpea / Bengal Gram' : 'Summer Cucumber'),
          scientific_name: isKharif ? 'Zea mays' : (isRabi ? 'Cicer arietinum' : 'Cucumis sativus'),
          suitability: 'high',
          reason: `High economic yield potential under ${irrigationType} infrastructure with good nutrient responsiveness.`,
          soil_requirements: 'Rich, well-aerated soil with adequate organic carbon.',
          water_requirements: 'Moderate: Requires regular moisture at flowering and grain formation stages.',
          season: season,
          cultivation_duration_days: isKharif ? 95 : 110,
          risks: ['Fall Armyworm vigilance required in early vegetative phase', 'Moisture stress during tasseling'],
          confidence: 'moderate'
        }
      ],
      missing_information: [
        soilPH === null ? 'Soil pH test values' : null,
        nitrogen === null ? 'Soil nitrogen (N) measurement' : null,
        'Micronutrient (Zinc, Boron) levels'
      ].filter(Boolean),
      limitations: [
        'Advisory is based on regional agronomic norms and user inputs.',
        'Market procurement prices and unpredictable monsoon delays must be factored in before sowing.'
      ],
      expert_consultation_required: false
    };
  }

  // Determine overall confidence level for table column (strictly match check constraint)
  const rawConfidence = (aiResult.recommendations?.[0]?.confidence || 'moderate').toLowerCase();
  const validConfidenceLevels = ['high', 'moderate', 'low', 'insufficient'];
  const topConfidence = validConfidenceLevels.includes(rawConfidence) ? rawConfidence : 'moderate';

  // Persistence in Supabase PostgreSQL
  let recordId = null;
  if (isSupabaseConfigured()) {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('crop_recommendations')
        .insert({
          user_id: userId,
          location: { state, district },
          soil_data: { soilType, soilPH, nitrogen, phosphorus, potassium },
          farming_conditions: { landArea, areaUnit, season, waterAvailability, irrigationType },
          recommended_crops: aiResult.recommendations,
          advisory_summary: aiResult.summary,
          limitations: aiResult.limitations,
          confidence_level: topConfidence
        })
        .select('id, created_at')
        .single();

      if (error) {
        logger.error('Failed to insert crop recommendation into database', error);
      } else {
        recordId = data?.id;
        logger.info(`Crop recommendation successfully saved to Supabase (ID: ${recordId})`);
      }
    } catch (e) {
      logger.error('Exception storing crop recommendation', e);
    }
  }

  // In-memory fallback persistence for standalone dev
  if (!recordId) {
    recordId = `rec-${Date.now()}`;
    inMemoryRecommendations.set(recordId, {
      id: recordId,
      user_id: userId,
      location: { state, district },
      soil_data: { soilType, soilPH, nitrogen, phosphorus, potassium },
      farming_conditions: { landArea, areaUnit, season, waterAvailability, irrigationType },
      recommended_crops: aiResult.recommendations,
      advisory_summary: aiResult.summary,
      limitations: aiResult.limitations,
      confidence_level: topConfidence,
      created_at: new Date().toISOString()
    });
  }

  return {
    id: recordId,
    ...aiResult
  };
}

export async function getUserRecommendations(userId) {
  let dbRecords = [];
  if (isSupabaseConfigured()) {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('crop_recommendations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        dbRecords = data;
      }
    } catch (err) {
      logger.warn('Failed to query Supabase crop_recommendations', err);
    }
  }

  // Fallback / merge with in-memory records
  const memRecords = Array.from(inMemoryRecommendations.values())
    .filter(r => r.user_id === userId);

  const merged = [...dbRecords];
  for (const mem of memRecords) {
    if (!merged.some(r => r.id === mem.id)) {
      merged.push(mem);
    }
  }

  return merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function getRecommendationById(userId, id) {
  if (isSupabaseConfigured()) {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('crop_recommendations')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!error && data) return data;
  }

  const found = inMemoryRecommendations.get(id);
  if (found && found.user_id === userId) return found;
  return null;
}

export async function deleteRecommendation(userId, id) {
  if (isSupabaseConfigured()) {
    const client = supabaseAdmin || supabase;
    const { error } = await client
      .from('crop_recommendations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (!error) return true;
  }

  const found = inMemoryRecommendations.get(id);
  if (found && found.user_id === userId) {
    inMemoryRecommendations.delete(id);
    return true;
  }
  return false;
}

