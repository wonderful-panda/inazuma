export const RESET = "\x1b[0m";
export const CRLF = "\x1b[1E";
export const BOLD = "\x1b[1m";
export const ULINE = "\x1b[4m";

const colors = {
  white: 37,
  red: 31,
  green: 32,
  yellow: 33
};
const color = (c: keyof typeof colors) => `\x1b[${colors[c]}m`;

export const WHITE = color("white");
export const RED = color("red");
export const YELLOW = color("yellow");
export const GREEN = color("green");
