import { describe, expect, it } from "vitest";
import { formatDate, formatDateTime, formatDateTimeLong } from "./date";

// Use a fixed Unix timestamp: 2024-06-15T12:34:56Z
const TIMESTAMP = 1718451296000;

describe("formatDate", () => {
  it("returns a non-empty date string", () => {
    const result = formatDate(TIMESTAMP);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("returns consistent output for the same input", () => {
    expect(formatDate(TIMESTAMP)).toBe(formatDate(TIMESTAMP));
  });
});

describe("formatDateTime", () => {
  it("returns a non-empty datetime string", () => {
    const result = formatDateTime(TIMESTAMP);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });

  it("contains more info than formatDate", () => {
    // formatDateTime includes time, so it should be longer than formatDate
    expect(formatDateTime(TIMESTAMP).length).toBeGreaterThan(formatDate(TIMESTAMP).length);
  });
});

describe("formatDateTimeLong", () => {
  it("returns a non-empty long datetime string", () => {
    const result = formatDateTimeLong(TIMESTAMP);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
  });
});
