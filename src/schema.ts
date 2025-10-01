import { z } from 'zod/v4';

export const InvoiceExtractionSchema = z.object({
  invoiceNumber: z.string().nullable(),
  invoiceDate: z.string().nullable(),
  dueDate: z.string().nullable(),
  paymentTerms: z.string().nullable(),
  totalAmount: z.number().nullable(),
  currency: z.string().nullable(),
});

export type InvoiceExtraction = z.infer<typeof InvoiceExtractionSchema>;
