import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createStateStorage } from "./stateStorage";

vi.mock("./invokeTauriCommand", () => ({
  invokeTauriCommand: vi.fn().mockResolvedValue(undefined)
}));

describe("createStateStorage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("getItem returns null for missing key", () => {
    const storage = createStateStorage("prefix:", {});
    expect(storage.getItem("missing")).toBeNull();
  });

  it("getItem returns initial state value", () => {
    const storage = createStateStorage("prefix:", { "prefix:key": "value" });
    expect(storage.getItem("key")).toBe("value");
  });

  it("setItem updates value retrieved by getItem", () => {
    const storage = createStateStorage("prefix:", {});
    storage.setItem("key", "hello");
    expect(storage.getItem("key")).toBe("hello");
  });

  it("setItem notifies subscribers", () => {
    const storage = createStateStorage("prefix:", {});
    const listener = vi.fn();
    storage.subscribe("key", listener);
    storage.setItem("key", "value");
    expect(listener).toHaveBeenCalledOnce();
  });

  it("setItem does not notify when value is unchanged", () => {
    const storage = createStateStorage("prefix:", { "prefix:key": "same" });
    const listener = vi.fn();
    storage.subscribe("key", listener);
    storage.setItem("key", "same");
    expect(listener).not.toHaveBeenCalled();
  });

  it("unsubscribe removes listener", () => {
    const storage = createStateStorage("prefix:", {});
    const listener = vi.fn();
    storage.subscribe("key", listener);
    storage.unsubscribe("key", listener);
    storage.setItem("key", "value");
    expect(listener).not.toHaveBeenCalled();
  });

  it("multiple listeners on same key all get notified", () => {
    const storage = createStateStorage("prefix:", {});
    const l1 = vi.fn();
    const l2 = vi.fn();
    storage.subscribe("key", l1);
    storage.subscribe("key", l2);
    storage.setItem("key", "value");
    expect(l1).toHaveBeenCalledOnce();
    expect(l2).toHaveBeenCalledOnce();
  });

  it("listeners on different keys are independent", () => {
    const storage = createStateStorage("prefix:", {});
    const l1 = vi.fn();
    const l2 = vi.fn();
    storage.subscribe("key1", l1);
    storage.subscribe("key2", l2);
    storage.setItem("key1", "value");
    expect(l1).toHaveBeenCalledOnce();
    expect(l2).not.toHaveBeenCalled();
  });

  it("uses prefix when storing values", () => {
    const storage = createStateStorage("app:", { "app:theme": "dark" });
    expect(storage.getItem("theme")).toBe("dark");
    expect(storage.getItem("app:theme")).toBeNull();
  });
});
