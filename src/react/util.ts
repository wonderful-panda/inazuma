export const assertNever = (_: never): never => {
  throw new Error("This function must be unreachable");
};

export const shortHash = (value: string) => value.slice(0, 8);
