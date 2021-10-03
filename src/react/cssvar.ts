type VarNames =
  | "--inazuma-standard-fontfamily"
  | "--inazuma-monospace-fontfamily"
  | "--inazuma-background-default"
  | "--inazuma-text-default";

export const setCssVariable = (name: VarNames, value: string) => {
  document.body.style.setProperty(name, value);
};

export const getCssVariable = (name: VarNames): string => {
  return getComputedStyle(document.body).getPropertyValue(name.trim());
};
