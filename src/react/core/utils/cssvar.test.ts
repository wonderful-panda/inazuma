import { beforeEach, describe, expect, it } from "vitest";
import { getCssVariable, setCssVariable } from "./cssvar";

beforeEach(() => {
  document.documentElement.style.cssText = "";
});

describe("setCssVariable", () => {
  it("sets a CSS variable on the root element", () => {
    setCssVariable("--inazuma-font-size", "14px");
    const value = document.documentElement.style.getPropertyValue("--inazuma-font-size");
    expect(value).toBe("14px");
  });

  it("overwrites previously set value", () => {
    setCssVariable("--inazuma-font-size", "12px");
    setCssVariable("--inazuma-font-size", "16px");
    const value = document.documentElement.style.getPropertyValue("--inazuma-font-size");
    expect(value).toBe("16px");
  });
});

describe("getCssVariable", () => {
  it("returns empty string when variable is not set", () => {
    const value = getCssVariable("--inazuma-font-size");
    expect(value).toBe("");
  });

  it("returns value after setCssVariable", () => {
    setCssVariable("--inazuma-background-default", "#ffffff");
    const value = getCssVariable("--inazuma-background-default");
    expect(value).toBe("#ffffff");
  });
});
