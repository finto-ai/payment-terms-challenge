import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface MarkdownExtractionResult {
  absolutePath: string;
  text: string;
}

export async function extractTextFromMarkdown(filePath: string): Promise<MarkdownExtractionResult> {
  const absolutePath = path.resolve(filePath);

  if (!absolutePath.toLowerCase().endsWith('.md')) {
    throw new Error(`The file "${filePath}" does not have a .md extension.`);
  }

  let text: string;
  try {
    text = await readFile(absolutePath, 'utf-8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`The markdown file could not be read: ${message}`);
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('The invoice contains no readable text.');
  }

  return { absolutePath, text: trimmedText };
}
