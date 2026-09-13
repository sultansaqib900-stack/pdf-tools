// === PDF RECIPES & MACRO AUTOMATION ENGINE ===
// Execute chained document operations locally in the browser.

import { scanPdfForPii, redactSelectedPii, type PiiType } from "./piiScanner";
import { copyPdfBytes, type PdfBinary } from "./pdfBytes";
import { encryptPdf } from "./pdfSecurity";
import { compressPdfBytes, type PdfCompressionMode } from "./pdfRaster";
import { sanitizePdf } from "./pdfSanitize";

export type RecipeActionType =
  | "pii_redact"
  | "bates_number"
  | "watermark"
  | "flatten"
  | "page_numbers"
  | "rotate"
  | "clean_metadata"
  | "compress"
  | "protect";

export interface RecipeActionConfig {
  type: RecipeActionType;
  params?: Record<string, unknown>;
}

export interface PdfRecipe {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  category: "Legal" | "Corporate" | "Academic" | "Finance" | "Custom";
  actions: RecipeActionConfig[];
}

export interface RecipeExecutionLog {
  step: string;
  status: "pending" | "running" | "completed" | "error";
  details?: string;
}

export interface RecipeExecutionOptions {
  /** Required by a recipe containing a password-protection action. */
  password?: string;
}

export class RecipeExecutionError extends Error {
  constructor(
    message: string,
    public readonly stepIndex: number,
    public readonly actionType: RecipeActionType,
  ) {
    super(message);
    this.name = "RecipeExecutionError";
  }
}

export const DEFAULT_RECIPES: PdfRecipe[] = [
  {
    id: "court_filing_standard",
    name: "Court & Legal E-Filing Standard",
    badge: "Legal Ready",
    icon: "⚖️",
    category: "Legal",
    description: "Auto-redacts SSNs and bank IDs, adds legal Bates numbering (CONF-000001), flattens form fields, removes metadata, and optimizes PDF streams.",
    actions: [
      { type: "pii_redact", params: { types: ["ssn", "iban", "creditCard"] } },
      { type: "bates_number", params: { prefix: "CONF-", startNumber: 1, digits: 6, position: "bottom-right" } },
      { type: "flatten" },
      { type: "clean_metadata" },
      { type: "compress" },
    ],
  },
  {
    id: "executive_signoff",
    name: "Executive & Client Confidential",
    badge: "Boardroom",
    icon: "🏢",
    category: "Corporate",
    description: "Applies a confidential watermark, adds page numbers, flattens form fields, removes metadata, optimizes the file, and applies AES-256 password protection.",
    actions: [
      { type: "watermark", params: { text: "CONFIDENTIAL & PRIVILEGED", opacity: 20, rotation: 45 } },
      { type: "page_numbers", params: { format: "Page {n} of {total}", position: "bottom-center" } },
      { type: "flatten" },
      { type: "clean_metadata" },
      { type: "compress" },
      { type: "protect" },
    ],
  },
  {
    id: "academic_grant_submission",
    name: "Academic & Grant Submission",
    badge: "Scholarly",
    icon: "🎓",
    category: "Academic",
    description: "Inserts standardized footer numbering, removes personal document metadata for blind peer review, and optimizes document streams.",
    actions: [
      { type: "page_numbers", params: { format: "{n}", position: "bottom-center" } },
      { type: "clean_metadata" },
      { type: "compress" },
    ],
  },
  {
    id: "financial_invoice_prep",
    name: "Financial Audit & Invoice Sanitizer",
    badge: "Finance",
    icon: "🧾",
    category: "Finance",
    description: "Auto-redacts card numbers, tax IDs, and bank account numbers, adds an AUDITED watermark, removes metadata, and optimizes the PDF.",
    actions: [
      { type: "pii_redact", params: { types: ["creditCard", "ssn", "iban"] } },
      { type: "watermark", params: { text: "AUDITED & VERIFIED", opacity: 15, rotation: 45 } },
      { type: "clean_metadata" },
      { type: "compress" },
    ],
  },
  {
    id: "privacy_scrubber",
    name: "Zero-Trace Privacy Scrubber",
    badge: "High Security",
    icon: "🛡️",
    category: "Corporate",
    description: "Finds common PII, securely rasterizes selected redactions so hidden text cannot be copied, removes metadata, and optimizes the result.",
    actions: [
      { type: "pii_redact", params: { types: ["ssn", "creditCard", "email", "phone", "iban", "ipAddress"] } },
      { type: "clean_metadata" },
      { type: "compress" },
    ],
  },
];

function numberParam(
  params: Record<string, unknown> | undefined,
  key: string,
  fallback: number,
): number {
  const value = params?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringParam(
  params: Record<string, unknown> | undefined,
  key: string,
  fallback: string,
): string {
  const value = params?.[key];
  return typeof value === "string" ? value : fallback;
}

function positionForText(
  position: string,
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  fontSize: number,
): { x: number; y: number } {
  const margin = 24;
  switch (position) {
    case "bottom-left":
      return { x: margin, y: margin };
    case "top-left":
      return { x: margin, y: pageHeight - margin - fontSize };
    case "top-right":
      return { x: Math.max(margin, pageWidth - textWidth - margin), y: pageHeight - margin - fontSize };
    case "top-center":
      return { x: Math.max(margin, (pageWidth - textWidth) / 2), y: pageHeight - margin - fontSize };
    case "bottom-center":
      return { x: Math.max(margin, (pageWidth - textWidth) / 2), y: margin };
    case "bottom-right":
    default:
      return { x: Math.max(margin, pageWidth - textWidth - margin), y: margin };
  }
}

function getPiiTypes(params?: Record<string, unknown>): PiiType[] {
  const types = params?.types;
  if (!Array.isArray(types)) return ["ssn", "creditCard", "email", "phone", "iban"];
  const valid: PiiType[] = ["ssn", "creditCard", "email", "phone", "currency", "iban", "ipAddress"];
  return types.filter((type): type is PiiType => typeof type === "string" && valid.includes(type as PiiType));
}

export async function executePdfRecipe(
  inputBytes: PdfBinary,
  recipe: PdfRecipe,
  onStepProgress?: (stepIndex: number, log: RecipeExecutionLog) => void,
  options: RecipeExecutionOptions = {},
): Promise<Uint8Array> {
  const { PDFDocument, rgb, StandardFonts, degrees } = await import("pdf-lib");
  let currentBytes = copyPdfBytes(inputBytes);

  if (currentBytes.byteLength === 0) throw new Error("The selected PDF is empty.");
  if (recipe.actions.length === 0) throw new Error("This recipe has no actions.");

  for (let index = 0; index < recipe.actions.length; index += 1) {
    const action = recipe.actions[index];
    const actionName = getActionLabel(action.type);
    onStepProgress?.(index, { step: actionName, status: "running" });

    try {
      let details = "";

      switch (action.type) {
        case "pii_redact": {
          const scan = await scanPdfForPii(copyPdfBytes(currentBytes), getPiiTypes(action.params));
          if (scan.totalMatches > 0) {
            currentBytes = await redactSelectedPii(copyPdfBytes(currentBytes), scan.matches);
            details = `Securely redacted ${scan.totalMatches} sensitive item${scan.totalMatches === 1 ? "" : "s"}`;
          } else {
            details = "No sensitive items found";
          }
          break;
        }

        case "watermark": {
          const pdfDoc = await PDFDocument.load(copyPdfBytes(currentBytes));
          const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          const text = stringParam(action.params, "text", "CONFIDENTIAL").trim();
          if (!text) throw new Error("Watermark text cannot be empty.");
          const opacity = Math.min(1, Math.max(0.05, numberParam(action.params, "opacity", 25) / 100));
          const rotation = numberParam(action.params, "rotation", 45);

          for (const page of pdfDoc.getPages()) {
            const { width, height } = page.getSize();
            let size = Math.max(18, Math.min(width, height) / 9);
            while (size > 18 && font.widthOfTextAtSize(text, size) > width * 0.78) size -= 2;
            const textWidth = font.widthOfTextAtSize(text, size);
            page.drawText(text, {
              x: Math.max(16, (width - textWidth) / 2),
              y: height / 2,
              size,
              font,
              color: rgb(0.7, 0.12, 0.12),
              opacity,
              rotate: degrees(rotation),
            });
          }
          currentBytes = await pdfDoc.save({ useObjectStreams: true });
          details = `Applied “${text}” watermark`;
          break;
        }

        case "bates_number": {
          const pdfDoc = await PDFDocument.load(copyPdfBytes(currentBytes));
          const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
          const prefix = stringParam(action.params, "prefix", "CONF-");
          const suffix = stringParam(action.params, "suffix", "");
          const startNumber = Math.trunc(numberParam(action.params, "startNumber", 1));
          const digits = Math.min(12, Math.max(1, Math.trunc(numberParam(action.params, "digits", 6))));
          const position = stringParam(action.params, "position", "bottom-right");
          const pages = pdfDoc.getPages();
          const fontSize = 10;

          pages.forEach((page, pageIndex) => {
            const number = String(startNumber + pageIndex).padStart(digits, "0");
            const label = `${prefix}${number}${suffix}`;
            const textWidth = font.widthOfTextAtSize(label, fontSize);
            const { width, height } = page.getSize();
            const point = positionForText(position, width, height, textWidth, fontSize);
            page.drawText(label, { ...point, size: fontSize, font, color: rgb(0.18, 0.18, 0.18) });
          });
          currentBytes = await pdfDoc.save({ useObjectStreams: true });
          details = `Stamped ${pages.length} Bates number${pages.length === 1 ? "" : "s"}`;
          break;
        }

        case "page_numbers": {
          const pdfDoc = await PDFDocument.load(copyPdfBytes(currentBytes));
          const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          const pages = pdfDoc.getPages();
          const total = pages.length;
          const format = stringParam(action.params, "format", "Page {n} of {total}");
          const position = stringParam(action.params, "position", "bottom-center");
          const fontSize = 9;

          pages.forEach((page, pageIndex) => {
            const label = format
              .replaceAll("{n}", String(pageIndex + 1))
              .replaceAll("{total}", String(total));
            const textWidth = font.widthOfTextAtSize(label, fontSize);
            const { width, height } = page.getSize();
            const point = positionForText(position, width, height, textWidth, fontSize);
            page.drawText(label, { ...point, size: fontSize, font, color: rgb(0.35, 0.35, 0.35) });
          });
          currentBytes = await pdfDoc.save({ useObjectStreams: true });
          details = `Numbered ${total} page${total === 1 ? "" : "s"}`;
          break;
        }

        case "flatten": {
          const pdfDoc = await PDFDocument.load(copyPdfBytes(currentBytes));
          let flattened = false;
          try {
            const form = pdfDoc.getForm();
            if (form.getFields().length > 0) {
              form.flatten();
              flattened = true;
            }
          } catch {
            // A document without an AcroForm needs no flattening.
          }
          currentBytes = await pdfDoc.save({ useObjectStreams: true });
          details = flattened ? "Flattened interactive form fields" : "No form fields to flatten";
          break;
        }

        case "rotate": {
          const pdfDoc = await PDFDocument.load(copyPdfBytes(currentBytes));
          const angle = Math.trunc(numberParam(action.params, "degrees", 90));
          for (const page of pdfDoc.getPages()) {
            const normalized = ((page.getRotation().angle + angle) % 360 + 360) % 360;
            page.setRotation(degrees(normalized));
          }
          currentBytes = await pdfDoc.save({ useObjectStreams: true });
          details = `Rotated all pages by ${angle}°`;
          break;
        }

        case "clean_metadata": {
          currentBytes = (await sanitizePdf(currentBytes)).bytes;
          details = "Removed metadata, XMP, attachments, actions, and annotations";
          break;
        }

        case "compress": {
          const requestedMode = stringParam(action.params, "mode", "lossless");
          const mode: PdfCompressionMode = requestedMode === "balanced" || requestedMode === "maximum" ? requestedMode : "lossless";
          const compressed = await compressPdfBytes(currentBytes, mode);
          currentBytes = compressed.bytes;
          const saved = Math.max(0, compressed.originalSize - compressed.outputSize);
          details = saved > 0
            ? `Reduced file by ${Math.round(saved / 1024)} KB (${mode})`
            : `PDF was already optimized (${mode})`;
          break;
        }

        case "protect": {
          if (index !== recipe.actions.length - 1) {
            throw new Error("Password protection must be the final recipe step.");
          }
          const password = options.password || stringParam(action.params, "password", "");
          if (!password) throw new Error("Enter a password to run this protected recipe.");
          currentBytes = await encryptPdf(currentBytes, password);
          details = "Applied AES-256 password encryption";
          break;
        }

        default: {
          const neverAction: never = action.type;
          throw new Error(`Unsupported recipe action: ${neverAction}`);
        }
      }

      onStepProgress?.(index, { step: actionName, status: "completed", details });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Step execution failed";
      onStepProgress?.(index, { step: actionName, status: "error", details: message });
      // Failing fast prevents the UI from downloading a partly processed file
      // while claiming that the complete recipe succeeded.
      throw new RecipeExecutionError(message, index, action.type);
    }
  }

  return copyPdfBytes(currentBytes);
}

export function getActionLabel(type: RecipeActionType): string {
  switch (type) {
    case "pii_redact": return "Scan & Redact PII";
    case "bates_number": return "Stamp Bates Numbers";
    case "watermark": return "Apply Watermark";
    case "flatten": return "Flatten Form Fields";
    case "page_numbers": return "Insert Page Numbers";
    case "rotate": return "Rotate Pages";
    case "clean_metadata": return "Sanitize Metadata";
    case "compress": return "Compress & Optimize";
    case "protect": return "AES-256 Password Protect";
  }
}

const CUSTOM_RECIPES_KEY = "pdftools_custom_recipes";
const ACTION_TYPES = new Set<RecipeActionType>([
  "pii_redact",
  "bates_number",
  "watermark",
  "flatten",
  "page_numbers",
  "rotate",
  "clean_metadata",
  "compress",
  "protect",
]);

function isSavedRecipe(value: unknown): value is PdfRecipe {
  if (!value || typeof value !== "object") return false;
  const recipe = value as Partial<PdfRecipe>;
  return (
    typeof recipe.id === "string" &&
    typeof recipe.name === "string" &&
    typeof recipe.description === "string" &&
    Array.isArray(recipe.actions) &&
    recipe.actions.length > 0 &&
    recipe.actions.every((action) => (
      action && typeof action === "object" && ACTION_TYPES.has((action as RecipeActionConfig).type)
    ))
  );
}

function readCustomRecipes(): PdfRecipe[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CUSTOM_RECIPES_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(isSavedRecipe) : [];
  } catch {
    return [];
  }
}

export function loadSavedRecipes(): PdfRecipe[] {
  return [...DEFAULT_RECIPES, ...readCustomRecipes()];
}

export function saveCustomRecipe(recipe: PdfRecipe): void {
  if (typeof localStorage === "undefined") return;
  if (!isSavedRecipe(recipe)) throw new Error("The custom recipe is invalid.");
  const existing = readCustomRecipes().filter((item) => item.id !== recipe.id);
  existing.push(recipe);
  localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(existing));
}

export function deleteCustomRecipe(recipeId: string): void {
  if (typeof localStorage === "undefined") return;
  const remaining = readCustomRecipes().filter((recipe) => recipe.id !== recipeId);
  localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(remaining));
}
