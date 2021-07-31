type ShortNames =
  | "standardFontfamily"
  | "monospaceFontfamily"
  | "backgroundDefault"
  | "backgroundPaper"
  | "primary"
  | "secondary"
  | "warning"
  | "error"
  | "info"
  | "success"
  | "textOnDefault"
  | "textOnPaper"
  | "textOnPrimary"
  | "textOnSecondary";

export const vname = (key: ShortNames) =>
  `--inazuma-${key.replace(/[A-Z]/, (v) => "-" + v.toLowerCase())}`;

export const setCssVariable = (key: ShortNames, value: string) => {
  document.body.style.setProperty(vname(key), value);
};

export const getCssVariable = (key: ShortNames): string => {
  return getComputedStyle(document.body).getPropertyValue(vname(key)).trim();
};
