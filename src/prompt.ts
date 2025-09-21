const FIELD_HELP = `Extrahiere aus der Rechnung folgende Daten:
- "invoiceNumber": Die Rechnungsnummer.
- "invoiceDate": Das Rechnungsdatum im ISO-Format (YYYY-MM-DD), falls verfügbar.
- "dueDate": Das Zahlungsziel als Datum im ISO-Format, falls angegeben.
- "paymentTerms": Das Zahlungsziel als Wortlaut (z. B. "Net 30 Tage" oder "Zahlbar sofort").
- "lineItems": Liste aller Positionen mit Beschreibung, Menge, Einzelpreis und Positionsgesamt.
- "totalAmount", "subtotal", "taxAmount", "amountDue": numerische Werte ohne Währungssymbole.
- "currency": ISO-Währungscode (z. B. EUR, USD), falls vorhanden.
- "supplier" und "customer": Firmenname, Adresse, Steuer- oder USt-ID sowie Kontaktinformationen.
- "paymentDetails": Bank- oder Zahlungsangaben (IBAN, BIC, Verwendungszweck etc.).
- "notes": Relevante Hinweise oder Fußnoten.
- "language": Die erkannte Sprache der Rechnung.
- "confidenceNotes": Unsicherheiten oder fehlende Informationen.`;

export const SYSTEM_INSTRUCTION = `Du bist GPT-5, ein Spezialist für die Extraktion strukturierter Rechnungsdaten aus PDF-Texten.
Halte dich strikt an das vorgegebene JSON-Schema. Verwende "null" bzw. lass Felder aus, wenn Informationen fehlen.
Nutze ISO-Datumsformate (YYYY-MM-DD) und Dezimalzahlen mit Punkt als Dezimaltrennzeichen.
Gib Zahlungsziele aussagekräftig wieder (z. B. "Net 30 days" oder "Zahlbar innerhalb von 14 Tagen nach Rechnungsdatum").
Schreibe alle Freitextfelder in der Sprache des Originaldokuments.`;

export function createInvoiceExtractionPrompt(invoiceText: string): string {
  return `${FIELD_HELP}\n\nRechnungstext zur Analyse:\n---\n${invoiceText}\n---`;
}
