export function splitCommandline(commandLine: string | undefined): string[] {
  if (!commandLine) {
    return [];
  }
  return commandLine.match(/("(\\"|[^"])*"|[^\s]+)/g) || [];
}

// length of CHARS must be 64
const CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~_";
export function randomName(length: number): string {
  let name = "";
  let randomValue = Math.random() * Math.pow(64, length);
  for (let i = 0; i < length; ++i) {
    name += CHARS[randomValue & 63];
    randomValue >>= 6;
  }
  return name;
}
