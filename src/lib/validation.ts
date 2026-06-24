export function validateString(value: unknown, maxLength = 10000): string | null {
  if (typeof value !== "string") return null;
  if (value.length > maxLength) return null;
  return value.trim();
}

export function validateNumber(value: unknown, min = 0, max = Infinity): number | null {
  if (typeof value !== "number") return null;
  if (isNaN(value)) return null;
  if (value < min || value > max) return null;
  return value;
}

export function validateEmail(value: unknown): string | null {
  const str = validateString(value, 255);
  if (!str) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str) ? str : null;
}

export function validateUrl(value: unknown): string | null {
  const str = validateString(value, 2048);
  if (!str) return null;
  try {
    new URL(str);
    return str;
  } catch {
    return null;
  }
}

export function validateArray(value: unknown, maxLength = 100): unknown[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > maxLength) return null;
  return value;
}

export function sanitizeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
