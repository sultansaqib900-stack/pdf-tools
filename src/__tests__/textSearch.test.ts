import { describe, expect, it } from "vitest";
import { findPositionedTextMatches, type PositionedTextItem } from "@/lib/textSearch";

function item(text: string, x: number, y = 100, width = text.length * 10): PositionedTextItem {
  return { text, x, y, width, height: 12 };
}

describe("positioned PDF text search", () => {
  it("finds a phrase split across adjacent PDF.js text items", () => {
    const result = findPositionedTextMatches([
      item("internal", 0, 100, 80),
      item("use", 86, 100, 30),
      item("only", 122, 100, 40),
    ], ["internal use only"]);

    expect(result.occurrenceCount).toBe(1);
    expect(result.areas.map((area) => area.itemIndex)).toEqual([0, 1, 2]);
  });

  it("rejoins implementation splits that occur inside one visible word", () => {
    const result = findPositionedTextMatches([
      item("confi", 0, 100, 50),
      item("dential", 50, 100, 70),
    ], ["confidential"]);

    expect(result.occurrenceCount).toBe(1);
    expect(result.areas).toHaveLength(2);
  });

  it("matches case-insensitively and maps a substring to character ratios", () => {
    const result = findPositionedTextMatches([item("Top SECRET file", 20)], ["secret"]);

    expect(result.occurrenceCount).toBe(1);
    expect(result.areas).toEqual([{ itemIndex: 0, startRatio: 4 / 15, endRatio: 10 / 15 }]);
  });

  it("does not join unrelated items separated by a large same-line gap", () => {
    const result = findPositionedTextMatches([
      item("internal", 0, 100, 80),
      item("use", 250, 100, 30),
    ], ["internaluse"]);

    expect(result.occurrenceCount).toBe(0);
  });
});
