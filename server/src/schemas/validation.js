import { z } from 'zod';

// ==============================================================================
// 1. CLIENT REQUEST SCHEMAS
// ==============================================================================

export const profileUpdateSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  phone: z.string().regex(/^\+?[0-9]{10,14}$/, "Please provide a valid phone number").optional().or(z.literal('')),
  state: z.string().min(2, "State is required").max(100),
  district: z.string().min(2, "District is required").max(100),
  village: z.string().max(100).optional().or(z.literal('')),
  preferred_language: z.enum(['en', 'hi', 'es', 'fr']).default('en'),
  farm_size: z.number().positive("Farm size must be greater than 0").optional(),
  farm_size_unit: z.enum(['acre', 'hectare', 'sq_meter', 'bigha']).default('acre')
});

export const cropRecommendationInputSchema = z.object({
  state: z.string().min(2, "State is required").max(100),
  district: z.string().min(2, "District is required").max(100),
  soilType: z.string().min(2, "Soil type is required").max(100),
  landArea: z.number().positive("Land area must be greater than 0"),
  areaUnit: z.enum(["acre", "hectare", "sq_meter", "bigha"]).default("acre"),
  season: z.enum(["kharif", "rabi", "zaid"]),
  waterAvailability: z.enum(["low", "moderate", "high"]),
  irrigationType: z.string().min(2, "Irrigation type is required").max(100),
  soilPH: z.number().min(0).max(14).optional().nullable(),
  nitrogen: z.number().nonnegative().optional().nullable(),
  phosphorus: z.number().nonnegative().optional().nullable(),
  potassium: z.number().nonnegative().optional().nullable(),
  additionalInformation: z.string().max(2000).optional().or(z.literal(''))
});

export const diseaseDetectionInputSchema = z.object({
  cropName: z.string().min(2, "Crop name is required").max(100),
  growthStage: z.string().max(100).optional().or(z.literal('')),
  symptoms: z.string().max(1000).optional().or(z.literal('')),
  location: z.string().max(200).optional().or(z.literal(''))
});

export const soilAdvisoryInputSchema = z.object({
  cropName: z.string().min(2, "Crop name is required").max(100),
  soilType: z.string().min(2, "Soil type is required").max(100),
  soilPH: z.number().min(0, "pH must be between 0 and 14").max(14).optional().nullable(),
  nitrogen: z.number().nonnegative("Nitrogen must be non-negative").optional().nullable(),
  phosphorus: z.number().nonnegative("Phosphorus must be non-negative").optional().nullable(),
  potassium: z.number().nonnegative("Potassium must be non-negative").optional().nullable(),
  organicCarbon: z.number().min(0).max(100).optional().nullable(),
  landArea: z.number().positive("Land area must be greater than 0").default(1),
  soilTestDate: z.string().optional().or(z.literal(''))
});

export const irrigationAdvisoryInputSchema = z.object({
  cropName: z.string().min(2, "Crop name is required").max(100),
  growthStage: z.string().min(2, "Growth stage is required").max(100),
  soilType: z.string().min(2, "Soil type is required").max(100),
  irrigationMethod: z.string().min(2, "Irrigation method is required").max(100),
  availableWater: z.enum(["low", "moderate", "high"]).default("moderate"),
  recentRainfallMm: z.number().min(0).optional().default(0),
  currentWeatherContext: z.string().max(500).optional().or(z.literal(''))
});

export const chatMessageInputSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message length exceeded"),
  sessionId: z.string().uuid("Valid session ID required").optional(),
  cropContext: z.string().max(100).optional(),
  locationContext: z.string().max(100).optional()
});

export const savedAdvisoryInputSchema = z.object({
  advisoryType: z.enum(['crop', 'disease', 'soil', 'irrigation']),
  advisoryId: z.string().uuid("Valid advisory ID required")
});

export const advisoryFeedbackInputSchema = z.object({
  advisoryType: z.enum(['crop', 'disease', 'soil', 'irrigation', 'chat']),
  advisoryId: z.string().uuid("Valid advisory ID required"),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(1000).optional().or(z.literal(''))
});

export const adminCropInputSchema = z.object({
  name: z.string().min(2).max(100),
  scientific_name: z.string().max(100).optional().or(z.literal('')),
  category: z.string().min(2).max(100),
  suitable_soils: z.array(z.string()).default([]),
  suitable_seasons: z.array(z.string()).default([]),
  water_requirement: z.enum(['low', 'moderate', 'high']).default('moderate'),
  climate_requirements: z.record(z.any()).default({}),
  cultivation_duration_days: z.number().int().positive().optional(),
  description: z.string().max(2000).optional().or(z.literal('')),
  region_tags: z.array(z.string()).default([]),
  is_active: z.boolean().default(true)
});

export const adminArticleInputSchema = z.object({
  title: z.string().min(3).max(250),
  category: z.string().min(2).max(100),
  content: z.string().min(10),
  language: z.string().default('en'),
  source_name: z.string().max(200).optional().or(z.literal('')),
  source_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean().default(false)
});

// ==============================================================================
// 2. GEMINI STRUCTURED AI OUTPUT SCHEMAS
// ==============================================================================

export const cropRecommendationResponseSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.object({
    crop_name: z.string(),
    scientific_name: z.string().nullable().optional(),
    suitability: z.enum(["high", "moderate", "low"]),
    reason: z.string(),
    soil_requirements: z.string(),
    water_requirements: z.string(),
    season: z.string(),
    cultivation_duration_days: z.number(),
    risks: z.array(z.string()),
    confidence: z.enum(["high", "moderate", "low"])
  })).min(1),
  missing_information: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  expert_consultation_required: z.boolean().default(false)
});

export const diseaseAnalysisResponseSchema = z.object({
  crop_name: z.string(),
  image_quality: z.enum(["good", "poor", "unusable"]),
  observed_symptoms: z.array(z.string()),
  possible_conditions: z.array(z.object({
    name: z.string(),
    category: z.enum(["fungal", "bacterial", "viral", "pest", "deficiency", "environmental", "unknown"]),
    likelihood: z.enum(["high", "moderate", "low"]),
    explanation: z.string()
  })),
  severity: z.enum(["mild", "moderate", "severe", "uncertain"]),
  preventive_actions: z.array(z.string()),
  recommended_next_steps: z.array(z.string()),
  additional_information_needed: z.array(z.string()).default([]),
  expert_review_recommended: z.boolean().default(false),
  limitations: z.array(z.string()).default([])
});

export const soilAdvisoryResponseSchema = z.object({
  soil_summary: z.string(),
  ph_interpretation: z.string(),
  nutrient_assessment: z.array(z.object({
    nutrient: z.string(),
    status: z.enum(["low", "adequate", "high", "unknown"]),
    explanation: z.string()
  })),
  soil_improvement_suggestions: z.array(z.string()),
  organic_management: z.array(z.string()),
  missing_information: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  expert_consultation_required: z.boolean().default(false)
});

export const irrigationAdvisoryResponseSchema = z.object({
  summary: z.string(),
  water_requirement_assessment: z.string(),
  irrigation_recommendation: z.string(),
  best_practices: z.array(z.string()),
  weather_considerations: z.array(z.string()),
  water_conservation_methods: z.array(z.string()),
  missing_information: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([])
});

export const chatbotResponseSchema = z.object({
  answer: z.string(),
  category: z.enum([
    "crop", "soil", "disease", "pest", "irrigation",
    "fertilizer", "weather", "general_agriculture", "unsupported"
  ]),
  suggested_follow_up_questions: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  requires_expert: z.boolean().default(false)
});

export const weatherAdvisoryResponseSchema = z.object({
  weather_summary: z.string(),
  agricultural_impacts: z.array(z.string()),
  recommended_actions: z.array(z.string()),
  potential_risks: z.array(z.string()),
  forecast_period: z.string(),
  data_limitations: z.array(z.string()).default([])
});

