import { describe, expect, it } from "vitest";
import {
  clamp,
  getExtension,
  getFileName,
  getFolderAndFileName,
  serializeError,
  shortHash,
  toSlashedPath
} from "./util";

describe("clamp", () => {
  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps to min when below range", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it("clamps to max when above range", () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("shortHash", () => {
  it("returns first 7 characters", () => {
    expect(shortHash("abc1234567890")).toBe("abc1234");
  });
});

describe("getFileName", () => {
  it("extracts filename from path", () => {
    expect(getFileName("src/react/utils/util.ts")).toBe("util.ts");
  });
  it("returns original string when no slash", () => {
    expect(getFileName("util.ts")).toBe("util.ts");
  });
});

describe("getFolderAndFileName", () => {
  it("splits path into folder and filename", () => {
    expect(getFolderAndFileName("src/react/util.ts")).toEqual(["src/react", "util.ts"]);
  });
  it("returns empty folder when no slash", () => {
    expect(getFolderAndFileName("util.ts")).toEqual(["", "util.ts"]);
  });
});

describe("getExtension", () => {
  it("returns extension including dot", () => {
    expect(getExtension("util.ts")).toBe(".ts");
  });
  it("returns extension from full path", () => {
    expect(getExtension("src/react/util.tsx")).toBe(".tsx");
  });
  it("returns empty string when no extension", () => {
    expect(getExtension("Makefile")).toBe("");
  });
});

describe("toSlashedPath", () => {
  it("converts backslashes to forward slashes", () => {
    expect(toSlashedPath("src\\react\\util.ts")).toBe("src/react/util.ts");
  });
  it("leaves forward slashes unchanged", () => {
    expect(toSlashedPath("src/react/util.ts")).toBe("src/react/util.ts");
  });
});

describe("serializeError", () => {
  it("serializes Error object", () => {
    const err = new Error("oops");
    const result = serializeError(err);
    expect(result.message).toBe("oops");
    expect(result.name).toBe("Error");
  });
  it("serializes string error", () => {
    const result = serializeError("something went wrong");
    expect(result.message).toBe("something went wrong");
  });
  it("serializes unknown value", () => {
    const result = serializeError(42);
    expect(result.message).toBe("42");
    expect(result.name).toBe("Unknown");
  });
});
