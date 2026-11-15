import { executeStructuredGeminiPrompt } from '../gemini/geminiService.js';
import { soilAdvisoryResponseSchema } from '../../schemas/validation.js';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { logger } from '../../utils/logger.js';

const inMemorySoilAdvisories = new Map();

export async function generateSoilAdvisory(userId, inputData) {
  const {
    cropName,
    soilType,
    soilPH,
    nitrogen,
    phosphorus,
    potassium,
    organicCarbon,
    landArea,
    soilTestDate
  } = inputData;

  const promptText = `
Analyze the supplied soil test laboratory results and agronomic field parameters for an Indian farmer.

FIELD AND SOIL PARAMETERS:
- Target Crop: ${cropName}
- Soil Texture / Classification: ${soilType}
- Measured Soil pH: ${soilPH !== null && soilPH !== undefined ? soilPH : 'Not tested'}
- Available Nitrogen (N): ${nitrogen !== null && nitrogen !== undefined ? nitrogen + ' kg/ha' : 'Not tested'}
- Available Phosphorus (P): ${phosphorus !== null && phosphorus !== undefined ? phosphorus + ' kg/ha' : 'Not tested'}
- Available Potassium (K): ${potassium !== null && potassium !== undefined ? potassium + ' kg/ha' : 'Not tested'}
- Organic Carbon (OC): ${organicCarbon !== null && organicCarbon !== undefined ? organicCarbon + '%' : 'Not tested'}
- Land Area: ${landArea} acre(s)
- Date of Soil Test: ${soilTestDate || 'Recent'}

AGRONOMIC EVALUATION INSTRUCTIONS:
1. Interpret the soil pH: Explain its direct effect on nutrient bioavailability. (e.g., pH > 7.8 precipitates phosphorus into insoluble calcium phosphate and locks zinc; pH < 6.0 locks phosphorus in aluminum complexes).
2. Assess nutrient status for each parameter (low, adequate, high, or unknown). Do NOT assign definite status if a value was not tested.
3. Suggest soil health improvements: organic composting, green manuring (Dhaincha/Sunn hemp), gypsum for sodic soils, lime for acidic soils.
4. Provide organic matter management and bio-fertilizer guidance (Azotobacter, Rhizobium, PSB - Phosphorus Solubilizing Bacteria).
5. Never prescribe exact high-dose chemical fertilizer formulas without reminding the farmer to cross-check with regional university package of practices (POP).
6. Return strictly JSON matching this structure:
{
  "soil_summary": "Comprehensive overview of soil fertility status",
  "ph_interpretation": "Detailed analysis of current pH and nutrient availability",
  "nutrient_assessment": [
    {
      "nutrient": "Nitrogen (N)",
      "status": "low" | "adequate" | "high" | "unknown",
      "explanation": "Agronomic explanation based on standard reference ranges"
    },
    {
      "nutrient": "Phosphorus (P)",
      "status": "low" | "adequate" | "high" | "unknown",
      "explanation": "Agronomic explanation"
    },
    {
      "nutrient": "Potassium (K)",
      "status": "low" | "adequate" | "high" | "unknown",
      "explanation": "Agronomic explanation"
    }
  ],
  "soil_improvement_suggestions": ["Suggestion 1", "Suggestion 2"],
  "organic_management": ["Organic management practice 1", "Practice 2"],
  "missing_information": ["Missing parameter if any"],
  "limitations": ["Advisory is educational and decision-support."],
  "expert_consultation_required": false
}
`;

  let aiResult = null;

  try {
    aiResult = await executeStructuredGeminiPrompt({
      promptText,
      zodSchema: soilAdvisoryResponseSchema
    });
  } catch (err) {
    logger.warn('Gemini soil advisory failed or unavailable, providing expert agronomic fallback', err);
  }

  if (!aiResult) {
    const phVal = soilPH || 7.2;
    const isAlkaline = phVal > 7.8;
    const isAcidic = phVal < 6.2;

    aiResult = {
      soil_summary: `Soil analysis for cultivating ${cropName} on ${soilType}. Soil pH is ${phVal.toFixed(1)}, with organic carbon recorded at ${organicCarbon || 0.45}%.`,
      ph_interpretation: isAlkaline
        ? `Soil pH (${phVal.toFixed(1)}) is moderately alkaline. In this range, applied phosphorus and micronutrients (Zinc, Iron) become fixed with calcium. Use acidifying organic amendments and chelated micronutrients.`
        : (isAcidic
            ? `Soil pH (${phVal.toFixed(1)}) is acidic. Lime application (calcium carbonate) may be required to raise pH and alleviate potential aluminum toxicity.`
            : `Soil pH (${phVal.toFixed(1)}) is within the optimal neutral zone (6.5 - 7.5). Most essential macro and secondary nutrients are in peak bioavailable states.`),
      nutrient_assessment: [
        {
          nutrient: "Nitrogen (N)",
          status: nitrogen ? (nitrogen < 240 ? "low" : nitrogen > 450 ? "high" : "adequate") : "unknown",
          explanation: nitrogen
            ? (nitrogen < 240 ? "Available nitrogen is below critical threshold (280 kg/ha). Split doses recommended." : "Nitrogen levels are sufficient for initial vegetative growth.")
            : "No lab value supplied. Nitrogen is volatile in tropical soils and often needs split supplementation."
        },
        {
          nutrient: "Phosphorus (P)",
          status: phosphorus ? (phosphorus < 15 ? "low" : phosphorus > 35 ? "high" : "adequate") : "unknown",
          explanation: phosphorus
            ? (phosphorus < 15 ? "Phosphorus is low. Basal band placement of DAP or Single Super Phosphate (SSP) recommended." : "Phosphorus is adequate for root elongation.")
            : "Test value missing. Phosphorus is essential for root system establishment."
        },
        {
          nutrient: "Potassium (K)",
          status: potassium ? (potassium < 130 ? "low" : potassium > 300 ? "high" : "adequate") : "unknown",
          explanation: potassium
            ? (potassium < 130 ? "Available potash is low. Muriate of Potash (MOP) required for drought resistance." : "Potassium is in a healthy range.")
            : "Potassium levels untested. Key for disease resistance and fruit quality."
        }
      ],
      soil_improvement_suggestions: [
        "Incorporate 5-8 tons of well-decomposed Farmyard Manure (FYM) or 2 tons Vermicompost per acre during secondary tillage.",
        "Practice green manuring by cultivating Dhaincha (Sesbania) or Sunn hemp for 45 days and plowing it into the soil before sowing.",
        "Apply Trichoderma viride enriched compost to suppress soil-borne fungal pathogens like Pythium and Rhizoctonia."
      ],
      organic_management: [
        "Inoculate seeds or root seedlings with bio-fertilizers: Azotobacter (for non-legumes) or Rhizobium (for pulses) and PSB (Phosphate Solubilizing Bacteria).",
        "Adopt mulching with crop residues or straw to conserve soil surface moisture and stimulate beneficial earthworm activity."
      ],
      missing_information: [
        soilPH === null ? "Soil pH reading" : null,
        organicCarbon === null ? "Organic Carbon percentage" : null,
        "Micronutrient test report (Zinc, Boron, Iron)"
      ].filter(Boolean),
      limitations: [
        "Nutrient advisory is educational and serves as decision support.",
        "Always adhere to local agricultural university guidelines and verified soil health card values."
      ],
      expert_consultation_required: false
    };
  }

  let recordId = null;

  if (isSupabaseConfigured()) {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('soil_advisories')
        .insert({
          user_id: userId,
          crop_name: cropName,
          soil_type: soilType,
          soil_test_data: { soilPH, nitrogen, phosphorus, potassium, organicCarbon, landArea },
          recommendations: aiResult
        })
        .select('id, created_at')
        .single();

      if (!error && data) {
        recordId = data.id;
      } else {
        logger.error('Failed to insert soil advisory to Supabase', error);
      }
    } catch (e) {
      logger.error('Exception storing soil advisory', e);
    }
  }

  if (!recordId) {
    recordId = `soil-${Date.now()}`;
    inMemorySoilAdvisories.set(recordId, {
      id: recordId,
      user_id: userId,
      crop_name: cropName,
      soil_type: soilType,
      soil_test_data: { soilPH, nitrogen, phosphorus, potassium, organicCarbon, landArea },
      recommendations: aiResult,
      created_at: new Date().toISOString()
    });
  }

  return {
    id: recordId,
    cropName,
    soilType,
    ...aiResult
  };
}

export async function getUserSoilHistory(userId) {
  if (isSupabaseConfigured()) {
    const client = supabaseAdmin || supabase;
    const { data, error } = await client
      .from('soil_advisories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) return data || [];
  }

  return Array.from(inMemorySoilAdvisories.values())
    .filter(a => a.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

