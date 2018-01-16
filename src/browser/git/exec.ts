import * as cp from "child_process";

const _gitCli = "git";

export interface ExecOptions {
  allowNonZeroExitCode?: boolean;
  onEachLine?: (line: string) => boolean | undefined | void;
}

export interface ExecParams extends ExecOptions {
  repository: string;
  args: string[];
}

export interface ExecResult {
  command: string;
  repository: string;
  args: string[];
  exitCode: number | null;
  signal: string | null;
  stderr: string;
  stdout: Buffer;
}

export function exec(command: string, params: ExecParams): Promise<ExecResult> {
  const args = ["-C", params.repository, command, ...params.args];
  const p = cp.spawn(_gitCli, args);
  const stdoutBuffers: Buffer[] = [];
  const stderrBuffers: Buffer[] = [];
  p.stdout.on("data", (b: Buffer) => stdoutBuffers.push(b));
  p.stderr.on("data", (b: Buffer) => stderrBuffers.push(b));

  if (params.onEachLine) {
    const cb = params.onEachLine;
    let lastLine = "";
    p.stdout.on("data", (b: Buffer) => {
      const lines = b.toString("utf8").split("\n");
      if (lastLine) {
        lines[0] = lastLine + lines[0];
      }
      lastLine = lines.pop()!;
      for (const line of lines) {
        if (cb(line) === false) {
          p.kill();
          break;
        }
      }
    });
    p.stdout.on("close", () => {
      if (lastLine) {
        cb(lastLine);
      }
    });
  }

  return new Promise<ExecResult>((resolve, reject) => {
    p.on("exit", (exitCode, signal) => {
      const result: ExecResult = {
        command,
        repository: params.repository,
        args: params.args,
        exitCode,
        signal,
        stdout: Buffer.concat(stdoutBuffers),
        stderr: Buffer.concat(stderrBuffers).toString("utf8")
      };
      if (signal === null && exitCode !== 0 && !params.allowNonZeroExitCode) {
        reject(new GitError(result));
      } else {
        resolve(result);
      }
    });
  });
}

export class GitError extends Error {
  public readonly command: string;
  public readonly args: string[];
  public readonly exitCode: number | null;
  public readonly signal: string | null;
  public readonly stderr: string;

  public constructor(result: ExecResult) {
    super();
    this.command = result.command;
    this.args = result.args;
    this.exitCode = result.exitCode;
    this.signal = result.signal;
    this.stderr = result.stderr;
    this.name = "GitError";
  }
}
