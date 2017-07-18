export function splitCommandline(commandLine: string): string[] {
    return commandLine.match(/("(\\"|[^"])*"|[^\s]+)/g);
}
