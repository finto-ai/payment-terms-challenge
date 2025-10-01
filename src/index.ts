#!/usr/bin/env node
import process from 'node:process';
import path from 'node:path';
import fs from 'node:fs';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { extractInvoiceDataFromMarkdown } from './extractor';

async function main(): Promise<void> {
  const parser = yargs(hideBin(process.argv))
    .scriptName('payment-terms-extractor')
    .usage('$0 <invoice-name>')
    .demandCommand(1, 'Please provide an invoice name (e.g., invoice1)')
    .strict()
    .help();

  const argv = await parser.parseAsync();
  const [firstArg] = argv._;

  if (typeof firstArg !== 'string') {
    console.error('Please provide an invoice name (e.g., invoice1)');
    process.exit(1);
    return;
  }

  // Allow simple invoice name like "invoice1" or full path
  let filePath = firstArg;
  if (!filePath.includes('/') && !filePath.endsWith('.md')) {
    // Assume it's just the invoice name, add data/ prefix and .md suffix
    filePath = path.join(process.cwd(), 'data', `${filePath}.md`);
  } else if (!path.isAbsolute(filePath)) {
    // Make relative paths absolute
    filePath = path.join(process.cwd(), filePath);
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    console.error('Available invoices: invoice1, invoice2, invoice3, invoice4, invoice5, invoice6');
    process.exit(1);
    return;
  }

  process.stderr.write(`Reading invoice from: ${filePath}\n`);
  process.stderr.write('Extracting data with GPT-5... ');

  try {
    const result = await extractInvoiceDataFromMarkdown(filePath);

    process.stderr.write('Done!\n');

    const output = {
      meta: {
        sourceFile: result.sourceFile,
        model: result.model,
        extractedAt: result.extractedAt,
      },
      invoice: result.invoice,
    };

    const jsonOutput = JSON.stringify(output, null, 2);

    // Save to output folder
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const invoiceName = path.basename(firstArg, '.md');
    const outputPath = path.join(outputDir, `${invoiceName}.json`);
    fs.writeFileSync(outputPath, jsonOutput + '\n');

    process.stderr.write(`Result saved to: ${outputPath}\n\n`);
    process.stdout.write(jsonOutput + '\n');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Fehler: ${message}`);
    process.exit(1);
  }
}

void main();
