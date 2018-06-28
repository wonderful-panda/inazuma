declare function css<T extends string = never>(
  strings: TemplateStringsArray,
  ...interporations: T[]
): { [K in T]: string };
