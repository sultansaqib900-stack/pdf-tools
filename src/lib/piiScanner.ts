// === PII SCANNER & GUARDIAN ENGINE ===
// High-precision client-side privacy detector for PDFs
// Detects SSNs, Credit Cards, Emails, Phone Numbers, Currency, IBANs, and IP Addresses.

export type PiiType =
  | "ssn"
  | "creditCard"
  | "email"
  | "phone"
  | "currency"
  | "iban"
  | "ipAddress";

export interface PiiMatch {
  id: string;
  type: PiiType;
  typeLabel: string;
  value: string;
  maskedValue: string;
  pageIndex: number; // 0-based
  x: number;
  y: number;
  w: number;
  h: number;
  selected: boolean;
}

export interface PiiScanResult {
  matches: PiiMatch[];
  byTypeCount: Record<PiiType, number>;
  totalPagesScanned: number;
  totalMatches: number;
}

// Regex patterns with validation boundaries
const PII_PATTERNS: Record<PiiType, { regex: RegExp; label: string; mask: (v: string) => string }> = {
  ssn: {
    // US SSN / National IDs (xxx-xx-xxxx or xxx xx xxxx or xxxxxxxxx)
    regex: /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g,
    label: "Social Security Number (SSN)",
    mask: (v) => `***-**-${v.replace(/\D/g, "").slice(-4)}`,
  },
  creditCard: {
    // Visa, MasterCard, Amex, Discover (13 to 19 digits formatted or unformatted)
    regex: /\b(?:\d{4}[ -]?){3}\d{4}\b|\b3[47]\d{2}[ -]?\d{6}[ -]?\d{5}\b/g,
    label: "Credit / Debit Card",
    mask: (v) => `****-****-****-${v.replace(/\D/g, "").slice(-4)}`,
  },
  email: {
    regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    label: "Email Address",
    mask: (v) => {
      const parts = v.split("@");
      const name = parts[0];
      const domain = parts[1] || "";
      return `${name.slice(0, 2)}***@${domain}`;
    },
  },
  phone: {
    // North American and international phone formats
    regex: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    label: "Phone Number",
    mask: (v) => {
      const digits = v.replace(/\D/g, "");
      return `(***) ***-${digits.slice(-4)}`;
    },
  },
  currency: {
    // Dollar, Euro, Pound, PKR, INR amounts
    regex: /(?:\$|€|£|Rs\.?|USD|EUR|GBP|PKR|INR)\s?\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b|\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|EUR|GBP|dollars?)\b/gi,
    label: "Financial / Salary Figure",
    mask: () => "$***,***.00",
  },
  iban: {
    // International Bank Account Number
    regex: /\b[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}\b/g,
    label: "IBAN / Bank Account",
    mask: (v) => `${v.slice(0, 4)} **** **** **** ${v.slice(-4)}`,
  },
  ipAddress: {
    // IPv4 Address
    regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    label: "IP Address",
    mask: (v) => `${v.split(".").slice(0, 2).join(".")}.*.*`,
  },
};

export async function scanPdfForPii(
  pdfBytes: Uint8Array | ArrayBuffer,
  activeTypes: PiiType[] = ["ssn", "creditCard", "email", "phone", "currency", "iban", "ipAddress"],
  customTerms: string[] = []
): Promise<PiiScanResult> {
  if (typeof globalThis !== "undefined") {
    if (typeof (globalThis as any).DOMMatrix === "undefined") {
      (globalThis as any).DOMMatrix = class DOMMatrix {};
    }
    if (typeof (globalThis as any).Path2D === "undefined") {
      (globalThis as any).Path2D = class Path2D {};
    }
  }

  const pdfjsLib = await import("pdfjs-dist");
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  }

  const uint8 = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
  const pdf = await pdfjsLib.getDocument({ data: uint8 }).promise;

  const matches: PiiMatch[] = [];
  const byTypeCount: Record<PiiType, number> = {
    ssn: 0,
    creditCard: 0,
    email: 0,
    phone: 0,
    currency: 0,
    iban: 0,
    ipAddress: 0,
  };

  for (let pageIdx = 0; pageIdx < pdf.numPages; pageIdx++) {
    const page = await pdf.getPage(pageIdx + 1);
    const content = await page.getTextContent();

    for (const item of content.items) {
      const tItem = item as { str: string; transform: number[]; width?: number; height?: number };
      const text = tItem.str || "";
      if (!text.trim()) continue;

      const basePos = {
        x: tItem.transform[4],
        y: tItem.transform[5],
        w: tItem.width || text.length * 6,
        h: tItem.height || 12,
      };

      // Check standard PII patterns
      for (const piiType of activeTypes) {
        const patternDef = PII_PATTERNS[piiType];
        if (!patternDef) continue;

        // Reset regex state
        patternDef.regex.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = patternDef.regex.exec(text)) !== null) {
          const matchedText = match[0];
          const charOffset = match.index;
          const avgCharWidth = basePos.w / Math.max(text.length, 1);
          const x = basePos.x + charOffset * avgCharWidth;
          const w = matchedText.length * avgCharWidth;

          matches.push({
            id: `pii_${pageIdx}_${piiType}_${matches.length}_${Date.now()}`,
            type: piiType,
            typeLabel: patternDef.label,
            value: matchedText,
            maskedValue: patternDef.mask(matchedText),
            pageIndex: pageIdx,
            x,
            y: basePos.y,
            w: Math.max(w, 20),
            h: Math.max(basePos.h, 10),
            selected: true,
          });

          byTypeCount[piiType]++;
        }
      }

      // Check custom user terms
      for (const term of customTerms) {
        if (!term.trim()) continue;
        const lowerText = text.toLowerCase();
        const lowerTerm = term.toLowerCase().trim();
        let idx = 0;
        while ((idx = lowerText.indexOf(lowerTerm, idx)) !== -1) {
          const matchedVal = text.substring(idx, idx + lowerTerm.length);
          const avgCharWidth = basePos.w / Math.max(text.length, 1);
          const x = basePos.x + idx * avgCharWidth;
          const w = lowerTerm.length * avgCharWidth;

          matches.push({
            id: `custom_${pageIdx}_${matches.length}_${Date.now()}`,
            type: "ssn", // classify generically
            typeLabel: `Custom Keyword: "${term}"`,
            value: matchedVal,
            maskedValue: "***" + matchedVal.slice(-2),
            pageIndex: pageIdx,
            x,
            y: basePos.y,
            w: Math.max(w, 20),
            h: Math.max(basePos.h, 10),
            selected: true,
          });

          idx += lowerTerm.length;
        }
      }
    }
  }

  return {
    matches,
    byTypeCount,
    totalPagesScanned: pdf.numPages,
    totalMatches: matches.length,
  };
}

export async function redactSelectedPii(
  pdfBytes: Uint8Array | ArrayBuffer,
  selectedMatches: PiiMatch[]
): Promise<Uint8Array> {
  const { PDFDocument, rgb } = await import("pdf-lib");
  const uint8 = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
  const pdfDoc = await PDFDocument.load(uint8, { ignoreEncryption: true });

  const pages = pdfDoc.getPages();

  for (const match of selectedMatches) {
    if (!match.selected || match.pageIndex >= pages.length) continue;
    const page = pages[match.pageIndex];

    // Draw opaque blackout rectangle with slight safety padding
    page.drawRectangle({
      x: Math.max(0, match.x - 2),
      y: Math.max(0, match.y - match.h * 0.2),
      width: match.w + 4,
      height: match.h + 4,
      color: rgb(0, 0, 0),
    });
  }

  return await pdfDoc.save({ useObjectStreams: true });
}
