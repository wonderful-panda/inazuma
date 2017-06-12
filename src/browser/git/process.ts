import * as cp from "child_process";

const _gitCli = "git";

export interface ExecResult {
    command: string;
    args: string[];
    stderr: string;
}

export interface ExecResultWithStdout extends ExecResult {
    stdout: string;
}

export interface TryExecResult extends ExecResult {
    exitCode: number;
}

export interface TryExecResultWithStdout extends ExecResult {
    exitCode: number;
    stdout: string;
}

interface EachLineCallback {
    (line: string): void;
}

export class GitError extends Error {
    public readonly command: string;
    public readonly args: string[];
    public readonly exitCode: number;
    public readonly stderr: string;

    public constructor(result: TryExecResult) {
        super(`\`git ${ result.command }\` fails with exit code(${ result.exitCode })`);
        this.command = result.command;
        this.args = result.args;
        this.exitCode = result.exitCode;
        this.stderr = result.stderr;
        this.name = "GitError";
    }
}

export function tryExec(repoPath: string, command: string, args: string[], stdoutCb: EachLineCallback): Promise<TryExecResult>;
export function tryExec(repoPath: string, command: string, args: string[]): Promise<TryExecResultWithStdout>;
export function tryExec(repoPath: string, command: string, args: string[], stdoutCb?: EachLineCallback): Promise<TryExecResult | TryExecResultWithStdout> {
    return new Promise<TryExecResult | TryExecResultWithStdout>(resolve => {
        const newArgs = ["-C", repoPath, command, ...args];
        const proc = cp.spawn(_gitCli, newArgs);
        proc.stdout.setEncoding("utf8");
        proc.stderr.setEncoding("utf8");
        const stderrOutput: string[] = [];
        proc.stderr.on("data", stderrOutput.push.bind(stderrOutput));
        if (stdoutCb) {
            proc.on("close", exitCode => {
                const stderr = stderrOutput.join("");
                resolve({ command, args, exitCode, stderr });
            });
            let lastLine = "";
            proc.stdout.on("data", (data: string) => {
                const lines = data.split("\n");
                // if data is not terminated by "\n", return it next time with rest part.
                if (lastLine) {
                    lines[0] = lastLine + lines[0];
                }
                lastLine = lines.pop();
                lines.forEach(stdoutCb);
            });
        }
        else {
            const stdoutOutput: string[] = [];
            proc.stdout.on("data", stdoutOutput.push.bind(stdoutOutput));
            proc.on("close", exitCode => {
                const stdout = stdoutOutput.join("");
                const stderr = stderrOutput.join("");
                resolve({ command, args, exitCode, stdout, stderr });
            });
        }
    })
}

export function exec(repoPath: string, command: string, args: string[], stdoutCb: EachLineCallback): Promise<ExecResult>;
export function exec(repoPath: string, command: string, args: string[]): Promise<ExecResultWithStdout>;
export function exec(repoPath: string, command: string, args: string[], stdoutCb?: EachLineCallback): Promise<ExecResult | ExecResultWithStdout> {
    return tryExec(repoPath, command, args, stdoutCb).then(result => {
        if (result.exitCode !== 0) {
            throw new GitError(result);
        }
        delete result.exitCode;
        return result;
    });
}

