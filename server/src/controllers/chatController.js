import { chatMessageInputSchema, chatbotResponseSchema } from '../schemas/validation.js';
import { executeStructuredGeminiPrompt } from '../services/gemini/geminiService.js';
import { supabase, supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { logger } from '../utils/logger.js';

const inMemorySessions = new Map();
const inMemoryMessages = new Map();

export async function sendMessage(req, res, next) {
  try {
    const validatedData = chatMessageInputSchema.parse(req.body);
    const userId = req.user.id;
    let sessionId = validatedData.sessionId;

    // Ensure session exists or create one
    if (!sessionId) {
      sessionId = await createSessionInternal(userId, validatedData.message.slice(0, 40) + '...');
    }

    // Retrieve prior messages for context
    const priorMessages = await getMessagesInternal(sessionId, 5);
    const conversationHistoryText = priorMessages
      .map(m => `${m.role === 'user' ? 'Farmer' : 'AgriSmart AI'}: ${m.content}`)
      .join('\n');

    // Save user's question
    await saveMessageInternal(sessionId, userId, 'user', validatedData.message);

    const promptText = `
You are the interactive AI Agronomist for AgriSmart AI answering an Indian farmer's question.

CONVERSATION CONTEXT:
${conversationHistoryText || 'Initial question in session'}

FARMER'S CURRENT QUESTION:
"${validatedData.message}"

ADDITIONAL CONTEXT:
- Relevant Crop: ${validatedData.cropContext || 'General Agriculture'}
- Location Context: ${validatedData.locationContext || req.profile?.state || 'India'}

INSTRUCTIONS:
1. Provide a direct, compassionate, highly practical agricultural answer in simple farmer-friendly language.
2. If the user asks non-agricultural questions (e.g. politics, coding, gossip), politely redirect them back to agricultural support and set category to "unsupported".
3. Distinguish between verified crop science and general field advice.
4. If the situation suggests high risk or disease outbreak, flag requires_expert as true.
5. Provide 2-3 natural follow-up questions the farmer might want to ask next.
6. Return strictly JSON matching this structure:
{
  "answer": "Clear practical response",
  "category": "crop" | "soil" | "disease" | "pest" | "irrigation" | "fertilizer" | "weather" | "general_agriculture" | "unsupported",
  "suggested_follow_up_questions": ["Question 1", "Question 2"],
  "warnings": ["Caution notice if any"],
  "requires_expert": false
}
`;

    let aiResult = null;

    try {
      aiResult = await executeStructuredGeminiPrompt({
        promptText,
        zodSchema: chatbotResponseSchema
      });
    } catch (err) {
      logger.warn('Gemini chat response failed or unavailable', err);
    }

    if (!aiResult) {
      aiResult = {
        answer: `Thank you for your question regarding "${validatedData.message}". In general agricultural practice in India, optimizing soil organic matter with well-decomposed manure, maintaining steady root zone moisture, and scouting early for pest eggs under leaves ensures healthy crop development. For specific chemical recommendations, verify with your local agricultural officer.`,
        category: "general_agriculture",
        suggested_follow_up_questions: [
          "How can I test my soil health before the next season?",
          "What organic pest repellents work best?",
          "What is the best irrigation timing during hot weather?"
        ],
        warnings: [
          "Always test small trial patches before applying any new foliar spray across the entire field."
        ],
        requires_expert: false
      };
    }

    // Save assistant's answer
    await saveMessageInternal(sessionId, userId, 'assistant', JSON.stringify(aiResult));

    return res.status(200).json({
      success: true,
      message: 'Message processed successfully',
      data: {
        sessionId,
        ...aiResult
      },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessions(req, res, next) {
  try {
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        return res.json({ success: true, message: 'Sessions retrieved', data, error: null });
      }
    }

    const userSessions = Array.from(inMemorySessions.values())
      .filter(s => s.user_id === userId)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    return res.json({ success: true, message: 'Sessions retrieved', data: userSessions, error: null });
  } catch (err) {
    next(err);
  }
}

export async function createSession(req, res, next) {
  try {
    const userId = req.user.id;
    const title = req.body.title || 'Agriculture Consultation';
    const sessionId = await createSessionInternal(userId, title);

    return res.status(201).json({
      success: true,
      message: 'Chat session created',
      data: { id: sessionId, title, user_id: userId },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessionMessages(req, res, next) {
  try {
    const { id } = req.params;
    const messages = await getMessagesInternal(id, 50);

    return res.json({
      success: true,
      message: 'Session messages retrieved',
      data: messages,
      error: null
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (isSupabaseConfigured()) {
      const client = supabaseAdmin || supabase;
      await client.from('chat_sessions').delete().eq('id', id).eq('user_id', userId);
    } else {
      inMemorySessions.delete(id);
      inMemoryMessages.delete(id);
    }

    return res.json({
      success: true,
      message: 'Chat session deleted',
      data: { id },
      error: null
    });
  } catch (err) {
    next(err);
  }
}

// Internal session helpers
async function createSessionInternal(userId, title) {
  if (isSupabaseConfigured()) {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('chat_sessions')
        .insert({ user_id: userId, title })
        .select('id')
        .single();
      if (!error && data) return data.id;
    } catch (e) {
      logger.error('Failed to create session in Supabase', e);
    }
  }

  const id = `session-${Date.now()}`;
  inMemorySessions.set(id, {
    id,
    user_id: userId,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  return id;
}

async function saveMessageInternal(sessionId, userId, role, content) {
  if (isSupabaseConfigured()) {
    try {
      const client = supabaseAdmin || supabase;
      await client.from('chat_messages').insert({ session_id: sessionId, user_id: userId, role, content });
      await client.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
      return;
    } catch (e) {
      logger.error('Failed to save chat message in Supabase', e);
    }
  }

  const messages = inMemoryMessages.get(sessionId) || [];
  messages.push({
    id: `msg-${Date.now()}-${Math.random()}`,
    session_id: sessionId,
    user_id: userId,
    role,
    content,
    created_at: new Date().toISOString()
  });
  inMemoryMessages.set(sessionId, messages);
}

async function getMessagesInternal(sessionId, limit = 20) {
  if (isSupabaseConfigured()) {
    try {
      const client = supabaseAdmin || supabase;
      const { data, error } = await client
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .limit(limit);
      if (!error && data) return data;
    } catch (e) {
      logger.error('Failed to fetch chat messages from Supabase', e);
    }
  }

  const messages = inMemoryMessages.get(sessionId) || [];
  return messages.slice(-limit);
}

