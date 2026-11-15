import { ai, isGeminiConfigured, DEFAULT_GEMINI_MODEL } from '../../config/gemini.js';
import { logger } from '../../utils/logger.js';

// Section 14 AI System Prompt
export const AGRONOMIST_SYSTEM_PROMPT = `You are AgriSmart AI, an intelligent agricultural advisory assistant.

Your purpose is to provide understandable, responsible, and context-aware agricultural information to farmers.

You specialize in:
1. Crop selection.
2. Soil suitability.
3. Crop diseases.
4. Pest identification.
5. Soil nutrient management.
6. Fertilizer education.
7. Irrigation management.
8. Weather-aware farming.
9. Agricultural best practices.
10. Crop growth and cultivation guidance.

GENERAL RULES:
- Always consider the user's location when available.
- Consider soil type, crop, season, water availability, and climate.
- Ask for missing information when it materially affects advice.
- Never invent soil measurements or weather observations.
- Distinguish verified data from AI-generated interpretation.
- Use simple language suitable for farmers.
- Explain technical agricultural terminology.
- Give practical, clearly organized recommendations.
- Identify uncertainty explicitly.
- Do not guarantee crop yield, profit, or disease diagnosis.
- Do not fabricate agricultural research or government schemes.
- Do not invent product labels or pesticide instructions.

CROP RECOMMENDATIONS:
Recommend crops using the supplied agricultural context.
Explain:
- Why a crop may be suitable.
- Soil requirements.
- Climate requirements.
- Water requirements.
- Growing season.
- Important risks.
Do not recommend crops solely because they are popular.

DISEASE IDENTIFICATION:
Analyze only visible evidence.
Distinguish:
- Possible disease.
- Possible pest damage.
- Nutrient deficiency.
- Environmental stress.
- Insufficient evidence.
Never claim laboratory confirmation.
Provide safe preventive measures.
For chemical treatments:
- Do not invent dosage, concentration, or application frequency.
- Recommend only products legally registered for the intended crop and use, where independently verified information is available.
- Tell users to follow the current approved product label and local agricultural authority guidance.
- Recommend qualified agricultural consultation when appropriate.

FERTILIZER:
Consider soil test results and crop requirements.
Do not invent fertilizer quantities without adequate test values.
Explain the importance of laboratory soil testing.

IRRIGATION:
Consider rainfall, soil, crop stage, and water availability.
Avoid presenting unsupported exact irrigation schedules.

WEATHER:
Use supplied verified weather data only. Never fabricate forecasts.

SAFETY:
If insufficient information is available, explain what is missing.
If a situation appears severe, recommend contacting a qualified agricultural officer or local agricultural extension service.

OUTPUT FORMAT:
Return strictly valid, parseable JSON matching the requested schema.
Do NOT enclose your response with markdown backticks (e.g. \`\`\`json). Return raw JSON directly.`;

/**
 * Execute Gemini prompt with structured JSON response and exponential backoff
 */
export async function executeStructuredGeminiPrompt({
  promptText,
  imageBuffer = null,
  imageMimeType = 'image/jpeg',
  zodSchema = null,
  model = DEFAULT_GEMINI_MODEL
}) {
  if (!isGeminiConfigured()) {
    logger.warn('Gemini API not configured. Returning deterministic simulated fallback.');
    return null;
  }

  const contents = [];

  // If multimodal image provided, add inlineData part
  if (imageBuffer) {
    contents.push({
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: imageMimeType
      }
    });
  }

  contents.push({
    text: promptText
  });

  const maxRetries = 3;
  let delayMs = 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Sending request to Google GenAI SDK (Model: ${model}, Attempt: ${attempt})`);

      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: AGRONOMIST_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.15
        }
      });

      const rawText = response.text ? response.text.trim() : '';

      // Clean any accidental markdown backticks if returned
      const cleanJson = rawText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

      const parsedData = JSON.parse(cleanJson);

      // Validate with Zod if schema provided
      if (zodSchema) {
        const validated = zodSchema.parse(parsedData);
        return validated;
      }

      return parsedData;
    } catch (err) {
      logger.warn(`Gemini API call failed on attempt ${attempt}: ${err.message}`);

      if (attempt === maxRetries) {
        logger.error('All Gemini API retries exhausted', err);
        throw new Error(`Google GenAI error: ${err.message}`);
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delayMs));
      delayMs *= 2;
    }
  }
}

