import OpenAI from 'openai';
import type { ResponseFormatTextJSONSchemaConfig } from 'openai/resources/responses/responses.js';
import { z } from 'zod/v4';

import { getOpenAIKey } from './env';
import { extractTextFromMarkdown } from './markdownLoader';
import { createInvoiceExtractionPrompt, SYSTEM_INSTRUCTION } from './prompt';
import { InvoiceExtractionSchema, InvoiceExtraction } from './schema';

export interface InvoiceExtractionResult {
  invoice: InvoiceExtraction;
  sourceFile: string;
  model: string;
  extractedAt: string;
  rawText: string;
}

export async function extractInvoiceDataFromMarkdown(
  filePath: string,
): Promise<InvoiceExtractionResult> {
  const apiKey = getOpenAIKey();
  const { absolutePath, text } = await extractTextFromMarkdown(filePath);

  const client = new OpenAI({ apiKey });

  const model = 'gpt-5-mini';

  const jsonSchema: ResponseFormatTextJSONSchemaConfig = {
    type: 'json_schema',
    name: 'invoice_extraction',
    schema: z.toJSONSchema(InvoiceExtractionSchema),
    strict: true,
  };

  try {
    const response = await client.responses.parse({
      model,
      reasoning: { effort: 'low' },
      text: { format: jsonSchema },
      input: [
        { role: 'developer', content: SYSTEM_INSTRUCTION },
        { role: 'user', content: createInvoiceExtractionPrompt(text) },
      ],
    });

    if (!response.output_parsed) {
      throw new Error('No structured data found in model output.');
    }

    return {
      invoice: response.output_parsed,
      sourceFile: absolutePath,
      model,
      extractedAt: new Date().toISOString(),
      rawText: text,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`GPT-5 could not process the invoice: ${message}`);
  }
}
