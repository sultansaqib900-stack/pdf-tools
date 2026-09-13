export interface CsvTable {
  headers: string[];
  rows: Record<string, string>[];
}

/** Parse RFC 4180-style CSV records, including quoted commas, quotes and newlines. */
export function parseCsvRecords(input: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  const text = input.replace(/^\uFEFF/, "");
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      record.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      record.push(field);
      field = "";
      if (record.some((value) => value.trim() !== "")) records.push(record);
      record = [];
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("The CSV contains an unterminated quoted value.");
  record.push(field);
  if (record.some((value) => value.trim() !== "")) records.push(record);
  if (records.length === 0) throw new Error("The CSV is empty.");
  return records;
}

/** Parse a CSV whose first record contains unique, non-empty headers. */
export function parseCsv(input: string): CsvTable {
  const records = parseCsvRecords(input);
  const headers = records[0].map((header) => header.trim());
  if (headers.some((header) => !header)) throw new Error("Every CSV column needs a header.");
  const normalized = headers.map((header) => header.toLocaleLowerCase());
  if (new Set(normalized).size !== headers.length) throw new Error("CSV headers must be unique.");

  const rows = records.slice(1).map((values) => Object.fromEntries(
    headers.map((header, index) => [header, values[index]?.trim() ?? ""]),
  ));

  return { headers, rows };
}

export function escapeCsvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}
