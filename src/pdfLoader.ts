import { readFile } from 'node:fs/promises';
import path from 'node:path';
import pdf from 'pdf-parse';

export interface PdfExtractionResult {
  absolutePath: string;
  text: string;
}

export async function extractTextFromPdf(filePath: string): Promise<PdfExtractionResult> {
  const absolutePath = path.resolve(filePath);

  if (!absolutePath.toLowerCase().endsWith('.pdf')) {
    throw new Error(`Die Datei "${filePath}" hat keine .pdf-Endung.`);
  }

  let fileBuffer: Buffer;
  try {
    fileBuffer = await readFile(absolutePath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Die PDF-Datei konnte nicht gelesen werden: ${message}`);
  }

  try {
    const parsed = await pdf(fileBuffer);
    const text = parsed.text?.trim();
    if (!text) {
      throw new Error('Die Rechnung enthält keinen auswertbaren Text.');
    }

    return { absolutePath, text };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Fehler beim Extrahieren des PDF-Inhalts: ${message}`);
  }
}
