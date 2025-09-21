import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';

import { loadConfig } from './env';
import { extractTextFromPdf } from './pdfLoader';
import { createInvoiceExtractionPrompt, SYSTEM_INSTRUCTION } from './prompt';
import { InvoiceExtractionSchema, InvoiceExtraction } from './schema';

export interface ExtractionOptions {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface InvoiceExtractionResult {
  invoice: InvoiceExtraction;
  sourceFile: string;
  model: string;
  extractedAt: string;
  rawText: string;
}

export async function extractInvoiceDataFromPdf(
  filePath: string,
  options: ExtractionOptions = {},
): Promise<InvoiceExtractionResult> {
  const overrides: { model?: string; temperature?: number; maxOutputTokens?: number } = {};
  if (options.model !== undefined) {
    overrides.model = options.model;
  }
  if (options.temperature !== undefined) {
    overrides.temperature = options.temperature;
  }
  if (options.maxOutputTokens !== undefined) {
    overrides.maxOutputTokens = options.maxOutputTokens;
  }

  const { openAI } = loadConfig(overrides);
  const { absolutePath, text } = await extractTextFromPdf(filePath);
  const prompt = createInvoiceExtractionPrompt(text);

  const client = new OpenAI({ apiKey: openAI.apiKey });

  try {
    const response = await client.responses.parse({
      model: openAI.model,
      input: prompt,
      instructions: SYSTEM_INSTRUCTION,
      temperature: openAI.temperature,
      ...(openAI.maxOutputTokens !== undefined ? { max_output_tokens: openAI.maxOutputTokens } : {}),
      text: {
        format: zodTextFormat(InvoiceExtractionSchema, 'InvoiceExtraction'),
      },
    });

    if (!response.output_parsed) {
      throw new Error('Keine strukturierten Daten im Modell-Output gefunden.');
    }

    return {
      invoice: response.output_parsed,
      sourceFile: absolutePath,
      model: openAI.model,
      extractedAt: new Date().toISOString(),
      rawText: text,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`GPT-5 konnte die Rechnung nicht verarbeiten: ${message}`);
  }
}
