type VarNames =
  | "--inazuma-font-size"
  | "--inazuma-standard-fontfamily"
  | "--inazuma-monospace-fontfamily"
  | "--inazuma-background-default"
  | "--inazuma-text-default";

export const setCssVariable = (name: VarNames, value: string) => {
  document.documentElement.style.setProperty(name, value);
};

export const getCssVariable = (name: VarNames): string => {
  return getComputedStyle(document.documentElement).getPropertyValue(name.trim());
};
