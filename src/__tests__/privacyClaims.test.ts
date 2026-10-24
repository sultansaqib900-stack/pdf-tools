import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("Audit Privacy and Security Claims", () => {
  it("does not claim air-gapped or HIPAA/GDPR certified status in PrivacyHUD", () => {
    const file = readFileSync(resolve(process.cwd(), "src/components/PrivacyHUD.tsx"), "utf8");
    expect(file).not.toContain("Air-Gapped Privacy");
    expect(file).not.toContain("HIPAA & GDPR Air-Gap");
    expect(file).not.toContain("Zero-Knowledge Verification");
    expect(file).toContain("Client-Side Engine");
    expect(file).toContain("Google Gemini API");
  });

  it("does not claim air-gapped or $0 enterprise status in competitor comparison pages", () => {
    const adobeFile = readFileSync(resolve(process.cwd(), "src/app/vs/adobe-acrobat/page.tsx"), "utf8");
    expect(adobeFile).not.toContain("Air-Gapped Zero-Server Guarantee");
    expect(adobeFile).not.toContain("complete air-gapped privacy for free");
    expect(adobeFile).not.toContain("$0 / Lifetime Free");
    expect(adobeFile).not.toContain("⚡ Open Free PDF Studio");

    const smallpdfFile = readFileSync(resolve(process.cwd(), "src/app/vs/smallpdf/page.tsx"), "utf8");
    expect(smallpdfFile).not.toContain("air-gapped");
    expect(smallpdfFile).not.toContain("⚡ Open Free PDF Studio");
  });

  it("Footer qualifies client-side processing for core tools and links to privacy policy", () => {
    const footerFile = readFileSync(resolve(process.cwd(), "src/components/Footer.tsx"), "utf8");
    expect(footerFile).toContain("Client-Side Privacy for Core Tools");
    expect(footerFile).toContain("/privacy");
  });
});

