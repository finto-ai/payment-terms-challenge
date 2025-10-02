const FIELD_HELP = `Extract the following data from the invoice:
- "invoiceNumber": The invoice number.
- "invoiceDate": The invoice date in ISO format (YYYY-MM-DD), if available.
- "dueDate": The due date in ISO format, if specified.
- "paymentTerms": The payment terms as text (e.g., "Net 30 days" or "Due upon receipt").
- "totalAmount": Numeric value without currency symbols.
- "currency": ISO currency code (e.g., EUR, USD), if available.`;

export const SYSTEM_INSTRUCTION = `You are a specialist in extracting structured invoice data from PDF texts.
Strictly adhere to the provided JSON schema. Use "null" for missing information.
Use ISO date formats (YYYY-MM-DD) and decimal numbers with a period as the decimal separator.
Provide payment terms clearly (e.g., "Net 30 days" or "Due within 14 days of invoice date").`;

export function createInvoiceExtractionPrompt(invoiceText: string): string {
  return `${FIELD_HELP}\n\nInvoice text for analysis:\n---\n${invoiceText}\n---`;
}
