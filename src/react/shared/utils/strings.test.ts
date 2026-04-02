import { describe, expect, it } from "vitest";
import { decodeBase64, decodeToString } from "./strings";

describe("decodeBase64", () => {
  it("decodes a base64 string to Uint8Array", () => {
    // "hello" in base64
    const result = decodeBase64("aGVsbG8=");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([104, 101, 108, 108, 111]);
  });

  it("decodes empty string", () => {
    const result = decodeBase64("");
    expect(result).toBeInstanceOf(Uint8Array);
    expect(result.length).toBe(0);
  });
});

describe("decodeToString", () => {
  it("decodes UTF-8 bytes to string", () => {
    const bytes = new TextEncoder().encode("hello");
    const { text, encoding } = decodeToString(bytes);
    expect(text).toBe("hello");
    expect(typeof encoding).toBe("string");
    expect(encoding.length).toBeGreaterThan(0);
  });

  it("returns encoding information", () => {
    const bytes = new TextEncoder().encode("test");
    const { encoding } = decodeToString(bytes);
    expect(encoding).toBeTruthy();
  });
});
