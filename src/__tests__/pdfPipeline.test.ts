import { describe, it, expect, beforeEach } from "vitest";
import {
  setPipelineDocument,
  getPipelineDocument,
  recordPipelineStep,
  getPipelineHistory,
  clearPipelineDocument,
  hasActivePipelineDoc,
} from "@/lib/pdfPipeline";

describe("PDF Pipeline State Manager", () => {
  beforeEach(async () => {
    await clearPipelineDocument();
  });

  it("should initialize empty", async () => {
    expect(hasActivePipelineDoc()).toBe(false);
    const doc = await getPipelineDocument();
    expect(doc).toBeNull();
  });

  it("should store and retrieve active document", async () => {
    const dummyBytes = new Uint8Array([37, 80, 68, 70, 45, 49, 46, 55]); // %PDF-1.7
    const id = await setPipelineDocument(dummyBytes, "contract.pdf");

    expect(id).toBeDefined();
    expect(hasActivePipelineDoc()).toBe(true);

    const doc = await getPipelineDocument();
    expect(doc).not.toBeNull();
    expect(doc?.name).toBe("contract.pdf");
    expect(doc?.bytes.length).toBe(dummyBytes.length);
  });

  it("should record pipeline steps in history", async () => {
    const initialBytes = new Uint8Array([1, 2, 3]);
    await setPipelineDocument(initialBytes, "test.pdf");

    const steppedBytes = new Uint8Array([4, 5, 6]);
    await recordPipelineStep("Watermark Applied", steppedBytes);

    const history = getPipelineHistory();
    expect(history.length).toBe(2);
    expect(history[0].name).toBe("Original Document");
    expect(history[1].name).toBe("Watermark Applied");
  });

  it("should clear pipeline state cleanly", async () => {
    const bytes = new Uint8Array([10, 20, 30]);
    await setPipelineDocument(bytes, "cleanup.pdf");
    expect(hasActivePipelineDoc()).toBe(true);

    await clearPipelineDocument();
    expect(hasActivePipelineDoc()).toBe(false);
    expect(await getPipelineDocument()).toBeNull();
    expect(getPipelineHistory().length).toBe(0);
  });
});
