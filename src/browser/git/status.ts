import { exec } from "./exec";
import { getWorkingTreeStat } from "./diff";

async function getUntrackedFiles(repository: string): Promise<readonly FileEntry[]> {
  const { stdout } = await exec("ls-files", {
    repository,
    args: ["-z", "--others", "--exclude-standard"]
  });
  const statusCode = "?";
  const inWorkingTree = true;
  const paths = stdout
    .toString("utf8")
    .split("\0")
    .filter((path) => !!path);
  return paths.map((path) => ({
    path,
    statusCode,
    inWorkingTree
  }));
}

export async function statusWithStat(repository: string): Promise<FileEntry[]> {
  const [staged, unstaged, untracked] = await Promise.all([
    getWorkingTreeStat(repository, true),
    getWorkingTreeStat(repository, false),
    getUntrackedFiles(repository)
  ]);
  return [...staged, ...unstaged, ...untracked].sort((a, b) => a.path.localeCompare(b.path));
}

export async function status(repository: string): Promise<FileEntry[]> {
  const ret: FileEntry[] = [];
  const { stdout } = await exec("status", { repository, args: ["-z"] });
  const values = stdout.toString("utf8").split("\0");
  for (let i = 0; i < values.length; ++i) {
    const value = values[i];
    if (value.length === 0) {
      break;
    }
    if (value.length < 4) {
      console.log("status/unexpected output:", value);
      continue;
    }
    const statusCode = value.slice(0, 2);
    const path = value.slice(3);
    let oldPath: string | undefined;
    if (statusCode[0] === "R") {
      // if renamed, next value is old path
      oldPath = values[++i];
    } else {
      oldPath = undefined;
    }
    if (statusCode[0] !== " " && statusCode !== "??") {
      ret.push({ path, oldPath, statusCode: statusCode[0], inIndex: true });
    }
    if (statusCode[1] !== " ") {
      ret.push({ path, statusCode: statusCode[1], inWorkingTree: true });
    }
  }
  return ret;
}
