# payment-terms-challenge

A Node.js application (TypeScript) that extracts payment terms, invoice data, and line items from markdown invoices. It uses OpenAI's GPT-5 responses endpoint. The application is implemented as a CLI tool and managed with pnpm.

## Features

- Extracts payment terms, invoice and customer data, amounts, and line items.
- Reads invoices locally from markdown files and passes the content to GPT-5.
- Uses structured outputs with JSON schema validation via `zod`.
- CLI with optional raw JSON output and preview of invoice text.

## Prerequisites

- Node.js 20 or newer
- pnpm (project file is already configured for it)
- A valid OpenAI API key with access to a GPT-5 model

## Installation

```bash
pnpm install
```

## Configuration

Store your OpenAI key (and optionally other settings) in a `.env` file or directly as environment variables:

```
OPENAI_API_KEY=sk-...
# optional
OPENAI_MODEL=gpt-5.0
OPENAI_TEMPERATURE=0
OPENAI_MAX_OUTPUT_TOKENS=2000
```

## Usage (CLI)

```bash
# Set environment variables
export OPENAI_API_KEY=sk-...
# optional: export OPENAI_MODEL=gpt-5.0

# Development version with ts-node
pnpm run extract ./data/invoice1.md

# or after build
pnpm run build
pnpm start ./data/invoice1.md

# raw JSON output
OPENAI_API_KEY=sk-... pnpm run extract ./data/invoice1.md --raw
```

### Important Options

| Option | Description |
| --- | --- |
| `-m, --model` | Override GPT-5 model (default: `gpt-5.0`). |
| `-t, --temperature` | Sampling temperature between 0 and 2. |
| `-o, --max-output-tokens` | Maximum number of generated tokens. |
| `--raw` | Only JSON output without additional information. |
| `--preview` | Additionally shows a short excerpt of the invoice text. |
| `--pretty/--no-pretty` | Output indented JSON with `--raw` (default: enabled). |

## Development Scripts

```bash
# Compile TypeScript
pnpm run build

# Type checking without output
pnpm run lint

# Start CLI directly via ts-node
pnpm run dev ./data/invoice1.md
```

## How it Works

1. **Markdown Reading:** Reads invoice content directly from markdown files.
2. **Prompt Creation:** A specialized prompt instructs GPT-5 to extract payment terms, amounts, and line items.
3. **Structured Output:** The model's response is validated against a `zod` schema, ensuring only clean JSON is returned.
4. **CLI Output:** Depending on options, a compact summary, table of line items, and complete JSON output are displayed.

> Note: GPT-5 is a powerful language model. Be mindful of sensitive content in invoices and never store API keys in source code.
