import { z } from 'zod/v4';

export const InvoiceExtractionSchema = z.object({
  invoiceNumber: z.string().meta({ description: 'The invoice number' }).nullable(),
  invoiceDate: z.string().meta({ description: 'Invoice date in ISO format (YYYY-MM-DD)' }).nullable(),
  dueDate: z.string().meta({ description: 'Payment due date in ISO format (YYYY-MM-DD)' }).nullable(),
  paymentTerms: z.string().meta({ description: 'Payment terms as text' }).nullable(),
  totalAmount: z.number().meta({ description: 'Total invoice amount as number' }).nullable(),
  currency: z.string().meta({ description: 'ISO currency code (e.g., EUR, USD)' }).nullable(),
});

export type InvoiceExtraction = z.infer<typeof InvoiceExtractionSchema>;
