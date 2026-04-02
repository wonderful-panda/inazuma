import type React from "react";
import { describe, expect, it } from "vitest";
import { getDragData, isDragDataPresent, setDragData } from "./dragdrop";

function createMockDragEvent(): React.DragEvent {
  const store: Record<string, string> = {};
  const types: string[] = [];
  return {
    dataTransfer: {
      types,
      setData(type: string, data: string) {
        store[type] = data;
        if (!types.includes(type)) {
          types.push(type);
        }
      },
      getData(type: string) {
        return store[type] ?? "";
      }
    }
  } as unknown as React.DragEvent;
}

describe("setDragData / isDragDataPresent / getDragData", () => {
  it("sets and retrieves branch data", () => {
    const e = createMockDragEvent();
    const data = { name: "main", current: true };

    setDragData(e, "git/branch", data);

    expect(isDragDataPresent(e, "git/branch")).toBe(true);
    expect(getDragData(e, "git/branch")).toEqual(data);
  });

  it("isDragDataPresent returns false for unset type", () => {
    const e = createMockDragEvent();
    expect(isDragDataPresent(e, "git/branch")).toBe(false);
  });

  it("getDragData returns undefined for unset type", () => {
    const e = createMockDragEvent();
    expect(getDragData(e, "git/branch")).toBeUndefined();
  });

  it("serializes and deserializes data as JSON", () => {
    const e = createMockDragEvent();
    const data = { name: "feature/my-branch", current: false };
    setDragData(e, "git/branch", data);
    const result = getDragData(e, "git/branch");
    expect(result).toEqual(data);
  });
});
