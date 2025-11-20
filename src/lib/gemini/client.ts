import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Model configurations
export const GEMINI_MODELS = {
  // Latest models as of November 2025
  PRO: 'gemini-2.0-flash-exp', // Fast and capable
  PRO_LATEST: 'gemini-2.5-pro', // Most capable
  FLASH: 'gemini-2.0-flash-exp', // Fastest
  EMBEDDING: 'text-embedding-004', // For embeddings
} as const;

export type GeminiModel = typeof GEMINI_MODELS[keyof typeof GEMINI_MODELS];

