import OpenAI from 'openai';
import type { ResponseFormatTextJSONSchemaConfig } from 'openai/resources/responses/responses.js';
import { z } from 'zod';

import { loadConfig } from './env';
import { extractTextFromMarkdown } from './markdownLoader';
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

export async function extractInvoiceDataFromMarkdown(
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
  const { absolutePath, text } = await extractTextFromMarkdown(filePath);

  const client = new OpenAI({ apiKey: openAI.apiKey });

  const jsonSchema: ResponseFormatTextJSONSchemaConfig = {
    type: 'json_schema',
    name: 'invoice_extraction',
    schema: z.toJSONSchema(InvoiceExtractionSchema, { target: 'draft-7' }),
    strict: true,
  };

  try {
    const response = await client.responses.parse({
      model: openAI.model,
      reasoning: { effort: 'medium' },
      text: { format: jsonSchema },
      input: [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: createInvoiceExtractionPrompt(text) },
      ],
    });

    if (!response.output_parsed) {
      throw new Error('No structured data found in model output.');
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
    throw new Error(`GPT-5 could not process the invoice: ${message}`);
  }
}
