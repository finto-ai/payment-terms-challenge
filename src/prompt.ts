export const SYSTEM_INSTRUCTION = `You are a specialist in extracting structured invoice data.
Strictly adhere to the provided JSON schema. Use "null" for missing information.
Use ISO date formats (YYYY-MM-DD) and decimal numbers with a period as the decimal separator.
Extract all fields defined in the schema, using the field descriptions as guidance.`;

export function createInvoiceExtractionPrompt(invoiceText: string): string {
  return `Extract invoice data according to the JSON schema.

Invoice text for analysis:
---
${invoiceText}
---`;
}
