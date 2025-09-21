import { z } from 'zod';

function coerceOptionalString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }

  return value === null || value === undefined ? undefined : String(value);
}

function coerceOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const sanitized = trimmed.replace(/[^0-9,.-]+/g, '');
  if (!sanitized) {
    return undefined;
  }

  const hasComma = sanitized.includes(',');
  const hasDot = sanitized.includes('.');
  let normalized = sanitized;

  if (hasComma && hasDot) {
    const lastComma = sanitized.lastIndexOf(',');
    const lastDot = sanitized.lastIndexOf('.');
    if (lastComma > lastDot) {
      normalized = sanitized.replace(/\./g, '').replace(',', '.');
    } else {
      normalized = sanitized.replace(/,/g, '');
    }
  } else if (hasComma) {
    const [integerPart, fractionalPart = ''] = sanitized.split(',');
    if (fractionalPart.length === 3) {
      normalized = `${integerPart}${fractionalPart}`;
    } else {
      normalized = `${integerPart}.${fractionalPart}`;
    }
  } else if (hasDot) {
    const [integerPart, fractionalPart = ''] = sanitized.split('.');
    if (fractionalPart.length === 3 && !sanitized.includes(',')) {
      normalized = `${integerPart}${fractionalPart}`;
    }
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}

const optionalString = z.preprocess(coerceOptionalString, z.string().optional());
const optionalNumber = z.preprocess(coerceOptionalNumber, z.number().optional());
const requiredTrimmedString = z
  .preprocess((value) => (typeof value === 'string' ? value.trim() : value), z.string().min(1));

export const ContactSchema = z
  .object({
    name: optionalString,
    email: optionalString,
    phone: optionalString,
  })
  .strict();

export const PartySchema = z
  .object({
    name: optionalString,
    address: optionalString,
    taxId: optionalString,
    vatId: optionalString,
    contact: ContactSchema.optional(),
  })
  .strict();

export const PaymentDetailsSchema = z
  .object({
    bankName: optionalString,
    accountHolder: optionalString,
    iban: optionalString,
    bic: optionalString,
    accountNumber: optionalString,
    routingNumber: optionalString,
    paymentReference: optionalString,
    paymentInstructions: optionalString,
  })
  .strict();

export const LineItemSchema = z
  .object({
    description: requiredTrimmedString,
    quantity: optionalNumber,
    unitPrice: optionalNumber,
    totalPrice: optionalNumber,
    sku: optionalString,
    serviceDate: optionalString,
    taxRate: optionalNumber,
    discount: optionalNumber,
    notes: optionalString,
  })
  .strict();

export const InvoiceExtractionSchema = z
  .object({
    supplier: PartySchema.optional(),
    customer: PartySchema.optional(),
    paymentDetails: PaymentDetailsSchema.optional(),
    invoiceNumber: optionalString,
    invoiceDate: optionalString,
    dueDate: optionalString,
    purchaseOrderNumber: optionalString,
    deliveryDate: optionalString,
    paymentTerms: optionalString,
    currency: optionalString,
    subtotal: optionalNumber,
    taxAmount: optionalNumber,
    totalAmount: optionalNumber,
    amountDue: optionalNumber,
    notes: optionalString,
    lineItems: z.array(LineItemSchema).default([]),
    language: optionalString,
    confidenceNotes: optionalString,
  })
  .strict();

export type Contact = z.infer<typeof ContactSchema>;
export type Party = z.infer<typeof PartySchema>;
export type PaymentDetails = z.infer<typeof PaymentDetailsSchema>;
export type LineItem = z.infer<typeof LineItemSchema>;
export type InvoiceExtraction = z.infer<typeof InvoiceExtractionSchema>;
