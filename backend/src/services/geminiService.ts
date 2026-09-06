import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getGeminiApiKey } from '../config/env.js';
import type { ChatMessage, AIReflection, ReflectionMode, WeeklyInsight } from '../types/index.js';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-latest';
const REQUEST_TIMEOUT_MS = 25000;

function getClient(): GoogleGenerativeAI {
  const apiKey = getGeminiApiKey();
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Execute a promise with a strict timeout.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = REQUEST_TIMEOUT_MS): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Gemini request timed out'));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timer!);
  }
}

/**
 * Execute a generative call with automatic exponential backoff retry for transient demand spikes.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2, initialDelayMs = 1000): Promise<T> {
  let delay = initialDelayMs;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await withTimeout(fn());
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const msg = (err as Error)?.message || '';
      const isTransient = status === 503 || status === 429 || msg.includes('503') || msg.includes('high demand') || msg.includes('temporarily');
      if (attempt === maxRetries || !isTransient) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 1.5;
    }
  }
  throw new Error('Gemini request failed after retries');
}

/**
 * Execute a generative operation with model failover if the primary model suffers a 503 demand spike.
 */
async function withModelFailover<T>(
  action: (modelName: string) => Promise<T>,
  models: string[] = [process.env.GEMINI_MODEL || 'gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.5-flash'],
): Promise<T> {
  let lastErr: unknown;
  for (const modelName of models) {
    try {
      return await withRetry(() => action(modelName), 2, 800);
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      const msg = (err as Error)?.message || '';
      const isOverloaded = status === 503 || status === 429 || msg.includes('503') || msg.includes('high demand');
      if (!isOverloaded) {
        throw err;
      }
      console.warn(`[Gemini] Model ${modelName} experiencing high demand (503). Failing over to next available model...`);
    }
  }
  throw lastErr;
}

/**
 * Generate conversational companion reply for Talk to Gemini mode.
 */
export async function generateChatReply(
  history: ChatMessage[],
  latestText: string,
): Promise<string> {
  return withModelFailover(async (modelName) => {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction:
        'You are a thoughtful, contemplative, and warm journaling companion in a private journal. ' +
        'Your goal is to listen deeply, ask gentle open-ended questions when appropriate, and mirror emotions without judgment or unsolicited clinical advice. ' +
        'Keep your responses concise, authentic, warm, and natural (1 to 3 short paragraphs).',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    const formattedContents = history.map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    formattedContents.push({
      role: 'user',
      parts: [{ text: latestText }],
    });

    const response = await model.generateContent({
      contents: formattedContents,
    });
    return response.response.text().trim();
  });
}

/**
 * Distill the core essence of raw journal writing into a succinct summary.
 */
export async function generateSummary(content: string): Promise<string> {
  return withModelFailover(async (modelName) => {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction:
        'You are an insightful journal editor. Read the user\'s raw writing and summarize its heart, main theme, and underlying feeling in 2 to 4 elegant, evocative sentences. ' +
        'Preserve the author\'s emotional tone. Do not judge, preach, or add robotic commentary.',
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 350,
      },
    });

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: content }] }],
    });
    return response.response.text().trim();
  });
}

/**
 * Generate a structured AIReflection containing key themes, goals, action items, and companion perspective.
 */
export async function generateStructuredReflection(
  mode: ReflectionMode,
  content: string,
  conversation?: ChatMessage[],
): Promise<AIReflection> {
  return withModelFailover(async (modelName) => {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING, description: 'Evocative title for this reflection (3-6 words)' },
            shortSummary: { type: SchemaType.STRING, description: 'Brief 2-3 sentence summary of the reflection' },
            keyThoughts: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: '2 to 4 core thoughts or recurring motifs',
            },
            themes: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: '2 to 4 overarching thematic tags e.g. Growth, Patience, Focus',
            },
            goals: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: '1 to 3 forward-looking goals or intentions expressed by the author',
            },
            actionItems: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
              description: '1 to 3 gentle, concrete action items if any were mentioned',
            },
            reflection: {
              type: SchemaType.STRING,
              description: 'A deeply contemplative companion perspective offering empathetic insight (2 paragraphs)',
            },
          },
          required: ['title', 'shortSummary', 'keyThoughts', 'themes', 'goals', 'actionItems', 'reflection'],
        },
      },
    });

    let prompt = `Reflection Mode: ${mode}\n\nUser Writing:\n${content}`;
    if (conversation && conversation.length > 0) {
      prompt += `\n\nDialogue Transcript:\n` +
        conversation.map((m) => `${m.sender === 'user' ? 'Author' : 'Gemini'}: ${m.text}`).join('\n');
    }

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const text = response.response.text();
    return JSON.parse(text) as AIReflection;
  });
}

/**
 * Synthesize cross-journal entries into a WeeklyInsight ("Your Week in Reflection").
 */
export async function generateWeeklyInsights(
  entries: Array<{
    id: string;
    title: string;
    date: string;
    originalContent: string;
    aiReflection?: AIReflection;
  }>,
): Promise<Omit<WeeklyInsight, 'id' | 'userId' | 'generatedAt'>> {
  const totalWords = entries.reduce(
    (acc, e) => acc + (e.originalContent ? e.originalContent.trim().split(/\s+/).filter(Boolean).length : 0),
    0,
  );

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekRange = `${weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  if (entries.length === 0) {
    return {
      weekRange,
      headline: 'A Quiet Horizon',
      narrativeOverview:
        'No journal entries were recorded in this reflection window. Take a moment to pause, breathe, and write your first thoughts whenever you feel ready.',
      recurringThemes: [],
      goalsIdentified: [],
      actionItemsRecorded: [],
      patternObservations: ['No historical activity detected for this cycle.'],
      reflectionHighlights: [],
      totalWordsWritten: 0,
      entriesAnalyzedCount: 0,
    };
  }

  const entriesSummary = entries.map((e, idx) => {
    return `[Entry ${idx + 1}] Date: ${e.date} | Title: "${e.title}"\nContent:\n${e.originalContent.slice(0, 3000)}\n${e.aiReflection ? `Themes: ${e.aiReflection.themes.join(', ')}` : ''}`;
  }).join('\n\n---\n\n');

  return withModelFailover(async (modelName) => {
    const genAI = getClient();
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            headline: { type: SchemaType.STRING, description: 'Captivating synthesis headline (4-8 words)' },
            narrativeOverview: {
              type: SchemaType.STRING,
              description: 'Comprehensive narrative synthesis of the user\'s week across all entries (2-3 paragraphs)',
            },
            recurringThemes: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  theme: { type: SchemaType.STRING },
                  count: { type: SchemaType.INTEGER },
                  description: { type: SchemaType.STRING },
                },
                required: ['theme', 'count', 'description'],
              },
            },
            goalsIdentified: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            actionItemsRecorded: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            patternObservations: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            reflectionHighlights: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  quote: { type: SchemaType.STRING },
                  journalTitle: { type: SchemaType.STRING },
                  date: { type: SchemaType.STRING },
                },
                required: ['quote', 'journalTitle', 'date'],
              },
            },
          },
          required: [
            'headline',
            'narrativeOverview',
            'recurringThemes',
            'goalsIdentified',
            'actionItemsRecorded',
            'patternObservations',
            'reflectionHighlights',
          ],
        },
      },
    });

    const prompt = `Analyze these ${entries.length} personal journal entries from the past week and generate a compassionate weekly synthesis.\n\n${entriesSummary}`;

    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    const parsed = JSON.parse(response.response.text());

    return {
      weekRange,
      headline: parsed.headline,
      narrativeOverview: parsed.narrativeOverview,
      recurringThemes: parsed.recurringThemes || [],
      goalsIdentified: parsed.goalsIdentified || [],
      actionItemsRecorded: parsed.actionItemsRecorded || [],
      patternObservations: parsed.patternObservations || [],
      reflectionHighlights: parsed.reflectionHighlights || [],
      totalWordsWritten: totalWords,
      entriesAnalyzedCount: entries.length,
    };
  });
}
