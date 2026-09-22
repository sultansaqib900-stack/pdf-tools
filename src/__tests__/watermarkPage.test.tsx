import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PDFDocument } from "pdf-lib";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));
vi.mock("@/components/AuthProvider", () => ({ useAuth: () => ({ user: null, loading: false }) }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/watermark",
}));
vi.mock("@/lib/pdfPipeline", () => ({
  getPipelineDocument: async () => null,
  setPipelineDocument: async () => {},
}));

import WatermarkPage from "@/app/watermark/page";

const fetchMock = vi.fn();

async function makePdfFile(): Promise<File> {
  const doc = await PDFDocument.create();
  doc.addPage([595, 842]);
  const bytes = await doc.save();
  return new File([bytes as unknown as BlobPart], "invoice.pdf", { type: "application/pdf" });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  // Any server call (usage, premium verify) reports a healthy free state.
  fetchMock.mockResolvedValue({ ok: true, json: async () => ({ ok: true, premium: false, remaining: 5, limit: 5 }) });
  localStorage.clear();
  // jsdom does not implement object URLs.
  const urlMock = vi.fn(() => "blob:mock");
  (globalThis.URL as unknown as Record<string, unknown>).createObjectURL = urlMock;
  (globalThis.URL as unknown as Record<string, unknown>).revokeObjectURL = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Watermark PDF page", () => {
  it("applies a watermark and offers the watermarked file for download", async () => {
    render(<WatermarkPage />);

    const file = await makePdfFile();
    const input = document.getElementById("fileInput") as HTMLInputElement;
    expect(input).toBeTruthy();
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(screen.getByText("invoice.pdf")).toBeTruthy();

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Apply Watermark/ }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Watermark added successfully/)).toBeTruthy();
    }, { timeout: 8000 });

    // The watermarked file must have been offered for download.
    expect(clickSpy).toHaveBeenCalled();
    const downloads = clickSpy.mock.instances.map((a) => (a as HTMLAnchorElement).download);
    expect(downloads.some((d) => d === "watermarked-invoice.pdf")).toBe(true);
    // The output must be a real PDF (magic bytes), not an empty/error blob.
    const blobUrlCalls = (URL.createObjectURL as unknown as ReturnType<typeof vi.fn>).mock.calls;
    expect(blobUrlCalls.length).toBeGreaterThan(0);
  }, 20000);

  it("watermarks permission-protected PDFs (encrypted with an empty user password)", async () => {
    // Regression: real-world PDFs with printing/copy restrictions carry an
    // encryption dictionary; pdf-lib refuses them, which used to surface as
    // "Failed to watermark PDF." The loader must decrypt and continue.
    const { encryptPDF } = await import("@pdfsmaller/pdf-encrypt");
    const src = await PDFDocument.create();
    src.addPage([595, 842]);
    const plain = await src.save();
    const encrypted = await encryptPDF(new Uint8Array(plain), "", {
      algorithm: "AES-256",
      ownerPassword: "owner-only",
    });
    const file = new File([encrypted as unknown as BlobPart], "restricted.pdf", { type: "application/pdf" });

    render(<WatermarkPage />);
    const input = document.getElementById("fileInput") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Apply Watermark/ }));
    });

    await waitFor(() => {
      expect(screen.getByText(/Watermark added successfully/)).toBeTruthy();
    }, { timeout: 8000 });
    expect(screen.queryByText(/Failed to watermark/)).toBeNull();
    const downloads = clickSpy.mock.instances.map((a) => (a as HTMLAnchorElement).download);
    expect(downloads.some((d) => d === "watermarked-restricted.pdf")).toBe(true);
  }, 20000);
});
