import { config as loadEnv } from 'dotenv';

loadEnv({ quiet: true });

export function getOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Please set the OPENAI_API_KEY environment variable to access GPT-5.');
  }
  return apiKey;
}
