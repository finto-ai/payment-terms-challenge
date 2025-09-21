#!/usr/bin/env node
import process from 'node:process';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { extractInvoiceDataFromPdf } from './extractor';

function formatAmount(amount?: number, currency?: string | null): string {
  if (amount === undefined) {
    return 'unbekannt';
  }

  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency ? `${formatted} ${currency}` : formatted;
}

function createSnippet(text: string, maxLength = 400): string {
  const normalised = text.replace(/\s+/g, ' ').trim();
  if (normalised.length <= maxLength) {
    return normalised;
  }

  return `${normalised.slice(0, maxLength - 1).trim()}…`;
}

async function main(): Promise<void> {
  const parser = yargs(hideBin(process.argv))
    .scriptName('payment-terms-extractor')
    .usage('$0 <pdf> [Optionen]')
    .option('model', {
      alias: 'm',
      type: 'string',
      describe: 'Name des GPT-5-Modells (Standard: gpt-5.0).',
    })
    .option('temperature', {
      alias: 't',
      type: 'number',
      describe: 'Sampling-Temperatur zwischen 0 und 2.',
    })
    .option('max-output-tokens', {
      alias: 'o',
      type: 'number',
      describe: 'Maximale Anzahl an Tokens für den Modell-Output.',
    })
    .option('raw', {
      type: 'boolean',
      default: false,
      describe: 'Nur den JSON-Output ohne zusätzliche Informationen ausgeben.',
    })
    .option('preview', {
      type: 'boolean',
      default: false,
      describe: 'Zusätzlich einen kurzen Textauszug der Rechnung anzeigen.',
    })
    .option('pretty', {
      type: 'boolean',
      default: true,
      describe: 'JSON-Ausgabe einrücken (nur in Kombination mit --raw).',
    })
    .demandCommand(1, 'Bitte gib den Pfad zu einer PDF-Rechnung an.')
    .strict()
    .help();

  const argv = await parser.parseAsync();
  const [firstArg] = argv._;

  if (typeof firstArg !== 'string') {
    console.error('Bitte gib den Pfad zu einer PDF-Rechnung an.');
    process.exit(1);
    return;
  }

  const temperature =
    typeof argv.temperature === 'number' && Number.isFinite(argv.temperature)
      ? argv.temperature
      : undefined;
  const maxOutputTokens =
    typeof argv.maxOutputTokens === 'number' && Number.isFinite(argv.maxOutputTokens)
      ? Math.trunc(argv.maxOutputTokens)
      : undefined;

  try {
    const extractionOptions: { model?: string; temperature?: number; maxOutputTokens?: number } = {};
    if (typeof argv.model === 'string' && argv.model.trim().length > 0) {
      extractionOptions.model = argv.model;
    }
    if (temperature !== undefined) {
      extractionOptions.temperature = temperature;
    }
    if (maxOutputTokens !== undefined) {
      extractionOptions.maxOutputTokens = Math.max(maxOutputTokens, 1);
    }

    const result = await extractInvoiceDataFromPdf(firstArg, extractionOptions);

    const output = {
      meta: {
        sourceFile: result.sourceFile,
        model: result.model,
        extractedAt: result.extractedAt,
      },
      invoice: result.invoice,
    };

    if (argv.raw) {
      const spacing = argv.pretty === false ? undefined : 2;
      process.stdout.write(`${JSON.stringify(output, null, spacing)}\n`);
      return;
    }

    console.log('Quelle:          ', output.meta.sourceFile);
    console.log('Modell:          ', output.meta.model);
    console.log('Extrahiert am:   ', output.meta.extractedAt);
    console.log('Rechnungsdatum:  ', output.invoice.invoiceDate ?? 'unbekannt');
    console.log('Fälligkeitsdatum:', output.invoice.dueDate ?? 'unbekannt');
    console.log('Zahlungsziel:    ', output.invoice.paymentTerms ?? 'unbekannt');
    console.log('Gesamtbetrag:    ', formatAmount(output.invoice.totalAmount ?? undefined, output.invoice.currency));

    if (output.invoice.lineItems && output.invoice.lineItems.length > 0) {
      console.log('\nPositionen:');
      console.table(
        output.invoice.lineItems.map((item, index) => ({
          Pos: index + 1,
          Beschreibung: item.description,
          Menge: item.quantity ?? '',
          Einzelpreis: item.unitPrice ?? '',
          Gesamt: item.totalPrice ?? '',
        })),
      );
    } else {
      console.log('\nKeine Positionen erkannt.');
    }

    if (argv.preview) {
      console.log('\nTextauszug:');
      console.log(createSnippet(result.rawText));
    }

    console.log('\nJSON-Ausgabe:');
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Fehler: ${message}`);
    process.exit(1);
  }
}

void main();
