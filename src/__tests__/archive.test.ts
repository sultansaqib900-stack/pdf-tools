import { describe, expect, it } from "vitest";
import { strFromU8, unzipSync } from "fflate";
import { createZipArchive } from "@/lib/archive";

describe("createZipArchive", () => {
  it("packages copied bytes under safe, unique names", () => {
    const source = new TextEncoder().encode("first");
    const archive = createZipArchive([
      { name: "../report.pdf", bytes: source },
      { name: "report.pdf", bytes: new TextEncoder().encode("second") },
    ]);
    source.fill(0);

    const entries = unzipSync(archive);
    expect(Object.keys(entries)).toEqual(["report.pdf", "report-2.pdf"]);
    expect(strFromU8(entries["report.pdf"])).toBe("first");
    expect(strFromU8(entries["report-2.pdf"])).toBe("second");
  });

  it("rejects empty archives", () => {
    expect(() => createZipArchive([])).toThrow("empty ZIP");
  });
});
