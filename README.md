# payment-terms-challenge

Eine Node.js-Anwendung (TypeScript), die Zahlungsziele, Rechnungsdaten und Positionen aus PDF-Rechnungen extrahiert. Dafür wird der GPT-5 Responses-Endpunkt von OpenAI genutzt. Die Anwendung ist als CLI-Werkzeug implementiert und wird mit pnpm verwaltet.

## Features

- Extrahiert Zahlungsziele, Rechnungs- und Kundendaten, Beträge und Positionen.
- Liest Rechnungen lokal aus PDF-Dateien und übergibt den bereinigten Text an GPT-5.
- Nutzt strukturierte Ausgaben mit JSON-Schema-Validierung über `zod`.
- CLI mit optionalem Roh-JSON-Output und Vorschau des eingelesenen Rechnungstextes.

## Voraussetzungen

- Node.js 20 oder neuer
- pnpm (die Projektdatei ist bereits dafür konfiguriert)
- Ein gültiger OpenAI-API-Schlüssel mit Zugriff auf ein GPT-5-Modell

## Installation

```bash
pnpm install
```

## Konfiguration

Hinterlege deinen OpenAI-Schlüssel (und optional weitere Einstellungen) in einer `.env`-Datei oder direkt als Umgebungsvariablen:

```
OPENAI_API_KEY=sk-...
# optional
OPENAI_MODEL=gpt-5.0
OPENAI_TEMPERATURE=0
OPENAI_MAX_OUTPUT_TOKENS=2000
```

## Verwendung (CLI)

```bash
# Umgebungsvariablen setzen
export OPENAI_API_KEY=sk-...
# optional: export OPENAI_MODEL=gpt-5.0

# Entwicklungsversion mit ts-node
pnpm run extract ./beispielrechnung.pdf

# oder nach dem Build
pnpm run build
pnpm start ./beispielrechnung.pdf

# reine JSON-Ausgabe
OPENAI_API_KEY=sk-... pnpm run extract ./rechnung.pdf --raw
```

### Wichtige Optionen

| Option | Beschreibung |
| --- | --- |
| `-m, --model` | GPT-5-Modell überschreiben (Standard: `gpt-5.0`). |
| `-t, --temperature` | Sampling-Temperatur zwischen 0 und 2. |
| `-o, --max-output-tokens` | Maximale Anzahl der generierten Tokens. |
| `--raw` | Nur die JSON-Ausgabe ohne weitere Informationen. |
| `--preview` | Zeigt zusätzlich einen kurzen Auszug des PDF-Textes. |
| `--pretty/--no-pretty` | JSON bei `--raw` eingerückt ausgeben (Standard: aktiviert). |

## Entwicklungsskripte

```bash
# TypeScript kompilieren
pnpm run build

# Typprüfung ohne Ausgabe
pnpm run lint

# CLI direkt über ts-node starten
pnpm run dev ./rechnung.pdf
```

## Funktionsweise

1. **PDF-Extraktion:** `pdf-parse` wandelt die Rechnung in reinen Text um.
2. **Prompterstellung:** Ein spezialisierter Prompt weist GPT-5 an, Zahlungsziele, Beträge und Positionen zu extrahieren.
3. **Strukturierte Ausgabe:** Die Antwort des Modells wird gegen ein `zod`-Schema validiert, sodass nur sauberes JSON zurückgegeben wird.
4. **CLI-Ausgabe:** Je nach Option werden eine kompakte Zusammenfassung, eine Tabelle der Positionen sowie der vollständige JSON-Output angezeigt.

> Hinweis: GPT-5 ist ein leistungsstarkes Sprachmodell. Achte auf sensible Inhalte in Rechnungen und speichere API-Schlüssel niemals im Quellcode.
