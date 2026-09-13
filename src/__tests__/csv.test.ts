import { describe, expect, it } from "vitest";
import { escapeCsvCell, parseCsv } from "@/lib/csv";

describe("CSV parser", () => {
  it("parses quoted commas, escaped quotes, newlines, CRLF and a BOM", () => {
    const csv = '\uFEFFNAME,COURSE,NOTE\r\n"Doe, Jane","PDF Basics","Line one\nLine ""two"""\r\n';
    expect(parseCsv(csv)).toEqual({
      headers: ["NAME", "COURSE", "NOTE"],
      rows: [{ NAME: "Doe, Jane", COURSE: "PDF Basics", NOTE: 'Line one\nLine "two"' }],
    });
  });

  it("rejects malformed and duplicate headers", () => {
    expect(() => parseCsv('name,NAME\nA,B')).toThrow(/unique/i);
    expect(() => parseCsv('name\n"unfinished')).toThrow(/unterminated/i);
  });

  it("escapes values for valid CSV output", () => {
    expect(escapeCsvCell('A, "B"')).toBe('"A, ""B"""');
    expect(escapeCsvCell("plain")).toBe("plain");
  });
});
