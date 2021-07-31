export const assertNever = (_: never): never => {
  throw new Error("This function must be unreachable");
};
