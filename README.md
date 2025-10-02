# Payment Terms Challenge

A Node.js CLI application (TypeScript) that extracts payment terms and key invoice data from markdown invoices using OpenAI's GPT-5 model.

## 🎯 Challenge Task

Your task is to extend the existing invoice extraction schema to capture more detailed information from invoices.

### Current Schema (Simplified)

The current implementation extracts only basic header information:
- Invoice number
- Invoice date
- Due date
- Payment terms (as text)
- Total amount
- Currency

### Your Goal

Extend the schema in `src/schema.ts` to extract payment terms.

1. **Payment Terms** (needs to be structured):
   Most invoices have two payment options:

   **a) Net Payment Term:**
   - `netDays` - Number of days until payment is due (e.g., 30)
   - `netDueDate` - Specific due date

   **b) Discount Payment Term(s):**
   - `discountPercentage` - Discount percentage (e.g., 2.5%)
   - `discountDays` - Days within which discount applies (e.g., 10)
   - `discountAmount` - Calculated discount amount in currency

   The days are relative to the invoice date. Be careful, sometimes not all items are eligible for discounts, we need to take care here.

   Not everthing needs to be done with an llm call, you can also add some post processing after the llm call for example.

### Edge Cases to Handle

The invoices include several real-world scenarios that your schema must handle:

**invoice7**: Copper surcharges excluded from early payment discount
- Copper surcharge line should have `isDiscountEligible: false`
- Discount calculation should only apply to eligible items
- Total discount: 2.5% on €1,460.00 = €36.50 (not on full €1,647.50)

**invoice8**: Multiple excluded charges (copper surcharge + freight & packaging)
- Both copper surcharge and freight lines marked as non-eligible
- 3% discount on €1,513.50 (not on €1,723.30)

**invoice9**: Delivery charges excluded from discount calculation
- Delivery line item should be `isDiscountEligible: false`
- 2% discount on goods value only

**invoice10**: Energy surcharges and special delivery excluded
- Energy surcharge and special delivery marked as non-eligible
- 2.5% discount within 10 days on materials only

Your schema should clearly distinguish eligible vs. non-eligible line items and calculate discounts accordingly.

### Required Output Fields

Your schema must include:

**Invoice Header:**
- Invoice number, date, due date, currency, total amount (already implemented)


**Structured Payment Terms:**
- Must extract **both** payment options (net and discount)
- **Net terms:** Include both the number of days (e.g., 30) AND the specific due date
- **Discount terms:** Must include ALL of the following:
  - Discount percentage (e.g., 2.5%)
  - Discount days (e.g., 10)
  - Discount amount (calculated in currency)

### What We're Looking For

- Clean, well-structured Zod schemas with appropriate nesting
- Proper handling of nullable/optional fields
- Clear field naming and types
- Ability to handle edge cases where certain charges are excluded from discounts
- Structured payment terms (not just text) with ALL required fields (days, dates, amounts, percentages)
- Code quality and TypeScript best practices

**Note:** Part of this challenge is designing an appropriate schema structure. Think about how to best model payment terms with nested objects.

### Submission

When you're done:
1. Test your solution with all invoices (`invoice1` through `invoice10`)
2. Review the JSON output in the `output/` folder
3. Ensure edge cases are handled correctly

No need to modify the prompt engineering or OpenAI integration - focus on the schema design!

## Prerequisites

- Node.js 20 or newer
- pnpm
- A valid OpenAI API key with access to GPT-5

## Available Test Invoices

**Standard invoices:** `invoice1` through `invoice6`
Basic invoices with straightforward payment terms.

**Edge case invoices (test these!)**:
- `invoice7` - Copper surcharges excluded from early payment discount
- `invoice8` - Multiple excluded charges (copper surcharge + freight & packaging)
- `invoice9` - Delivery charges excluded from discount calculation
- `invoice10` - Energy surcharges and special delivery costs excluded from discount

### Example Usage

```bash
# Test with a standard invoice
pnpm run extract invoice1

# Test with edge cases
pnpm run extract invoice7
pnpm run extract invoice8

# Check the output
cat output/invoice7.json
```

## Tips

- The project uses `tsx` for fast TypeScript execution (no build needed during development)
- Run `pnpm run lint` to check for TypeScript errors
- The prompt is in `src/prompt.ts` - you don't need to modify it
- Focus on the schema design in `src/schema.ts`
- Test frequently with different invoices to validate your schema

## Current Output Schema (Starter Code)

The current implementation in `src/schema.ts` is intentionally minimal:

```typescript
{
  invoiceNumber: string | null;
  invoiceDate: string | null;
  dueDate: string | null;
  paymentTerms: string | null;  // ⚠️ Just text - you need to structure this!
  totalAmount: number | null;
  currency: string | null;
  // ⚠️ Missing: lineItems array
  // ⚠️ Missing: structured payment terms with discount calculations
}
```

**Your task:** Extend this schema to match the requirements above.

Results are saved to `output/<invoice-name>.json` and printed to stdout.

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Set your OpenAI API key
export OPENAI_API_KEY=sk-...
# or create .env file: cp .env.example .env

# 3. Test the current implementation
pnpm run extract invoice1

# 4. Start working on your solution
# - Edit src/schema.ts to extend the schema
# - Test with: pnpm run extract invoice7 (edge case)
# - Review output in output/invoice7.json
```
