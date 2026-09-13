import { describe, expect, it } from "vitest";
import { mapSignatureFromViewport, type PdfPointViewport } from "@/lib/pdfSignature";

function expectPlacement(
  viewport: PdfPointViewport,
  expected: { x: number; y: number; rotation: number },
): void {
  const result = mapSignatureFromViewport(viewport, 50, 50, 100, 40);
  expect(result.x).toBeCloseTo(expected.x);
  expect(result.y).toBeCloseTo(expected.y);
  expect(result.width).toBeCloseTo(100);
  expect(result.height).toBeCloseTo(40);
  expect(result.rotation).toBeCloseTo(expected.rotation);
}

describe("signature viewport placement", () => {
  it("maps an unrotated top-left preview into PDF coordinates", () => {
    expectPlacement({
      width: 400,
      height: 600,
      convertToPdfPoint: (x, y) => [x, 600 - y],
    }, { x: 150, y: 280, rotation: 0 });
  });

  it("maps 90, 180, and 270 degree page rotations", () => {
    expectPlacement({
      width: 600,
      height: 400,
      convertToPdfPoint: (x, y) => [y, x],
    }, { x: 220, y: 250, rotation: 90 });

    expectPlacement({
      width: 400,
      height: 600,
      convertToPdfPoint: (x, y) => [400 - x, y],
    }, { x: 250, y: 320, rotation: 180 });

    expectPlacement({
      width: 600,
      height: 400,
      convertToPdfPoint: (x, y) => [400 - y, 600 - x],
    }, { x: 180, y: 350, rotation: -90 });
  });

  it("clamps the complete signature rectangle inside the preview", () => {
    const result = mapSignatureFromViewport({
      width: 400,
      height: 600,
      convertToPdfPoint: (x, y) => [x, 600 - y],
    }, 0, 100, 100, 40);

    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
  });
});
