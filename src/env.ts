import { config as loadEnv } from 'dotenv';

loadEnv();

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxOutputTokens?: number;
}

export interface AppConfig {
  openAI: OpenAIConfig;
}

type OpenAIConfigOverrides = Partial<Omit<OpenAIConfig, 'apiKey'>> & { apiKey?: string };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function parseOptionalNumber(raw: string | undefined): number | undefined {
  if (raw === undefined) {
    return undefined;
  }

  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

export function loadConfig(overrides: OpenAIConfigOverrides = {}): AppConfig {
  const apiKey = overrides.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Setze zuerst die Umgebungsvariable OPENAI_API_KEY, um auf GPT-5 zugreifen zu können.');
  }

  const model = overrides.model ?? process.env.OPENAI_MODEL ?? 'gpt-5.0';

  const temperatureCandidate = overrides.temperature ?? parseOptionalNumber(process.env.OPENAI_TEMPERATURE) ?? 0;
  const temperature = clamp(temperatureCandidate, 0, 2);

  const maxOutputTokens = overrides.maxOutputTokens ?? parseOptionalNumber(process.env.OPENAI_MAX_OUTPUT_TOKENS);

  return {
    openAI: {
      apiKey,
      model,
      temperature,
      ...(maxOutputTokens !== undefined ? { maxOutputTokens } : {}),
    },
  };
}
