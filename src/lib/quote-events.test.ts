import { describe, expect, it } from "vitest";
import { nearestIndex } from "./quote-events";

describe("nearestIndex", () => {
  it("picks the element whose top is closest to the top of the viewport", () => {
    expect(nearestIndex([-900, 300])).toBe(1);
    expect(nearestIndex([-100, 600])).toBe(0);
  });

  it("returns -1 when there is nothing to pick", () => {
    expect(nearestIndex([])).toBe(-1);
  });
});
