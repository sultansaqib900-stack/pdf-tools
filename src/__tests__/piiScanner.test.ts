import { describe, it, expect } from "vitest";

describe("PII Guardian Scanner Patterns & Masking", () => {
  const SSN_REGEX = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g;
  const CREDIT_CARD_REGEX = /\b(?:\d{4}[ -]?){3}\d{4}\b|\b3[47]\d{2}[ -]?\d{6}[ -]?\d{5}\b/g;
  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

  it("should match valid Social Security Numbers", () => {
    const text = "Client SSN is 123-45-6789 and secondary is 987 65 4321.";
    const matches = text.match(SSN_REGEX);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBe(2);
    expect(matches?.[0]).toBe("123-45-6789");
  });

  it("should match major credit card numbers", () => {
    const text = "Card on file: 4111 2222 3333 4444, backup: 5500-0000-0000-0004";
    const matches = text.match(CREDIT_CARD_REGEX);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBe(2);
  });

  it("should match email addresses accurately", () => {
    const text = "Contact alice.smith@company.co.uk or support@agency.org for info.";
    const matches = text.match(EMAIL_REGEX);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBe(2);
    expect(matches?.[0]).toBe("alice.smith@company.co.uk");
  });

  it("should match standard phone numbers", () => {
    const text = "Call +1 (555) 123-4567 or 555-987-6543 today.";
    const matches = text.match(PHONE_REGEX);
    expect(matches).not.toBeNull();
    expect(matches?.length).toBe(2);
  });
});
