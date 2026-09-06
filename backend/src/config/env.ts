import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading .env and .env.local from both backend dir and project root
const envPaths = [
  path.resolve(process.cwd(), '.env.local'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env.local'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), 'backend/.env.local'),
  path.resolve(process.cwd(), 'backend/.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

// In production (Cloud Run), PORT is set by Cloud Run (usually 8080).
// In local development, default to 8081 to avoid conflicts with other local services (e.g. Tomcat/8080).
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8081;

/**
 * Retrieves the Gemini API key strictly from environment variables.
 * Under Cloud Run, this is mounted from Google Cloud Secret Manager (Ideathon Project: GEMINI_API_KEY:1).
 * Never logged, never hardcoded.
 */
export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim() === '') {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return key.trim();
}
