import path from "path";
import fs from "fs-extra";
import cp from "child_process";
import { config } from "../persistent";
import { RepositorySession, repositorySessions } from "../repositorySession";
import { randomName, splitCommandline } from "../utils";
import { saveTo } from "../file";
import type { Handler } from ".";

const prepareDiffFile = async (rs: RepositorySession, file: FileSpec): Promise<string> => {
  if (file.revspec === "UNSTAGED") {
    // use file in the repository directly
    return path.join(rs.repoPath, file.path);
  }

  let absPath: string;
  if (file.revspec === "STAGED") {
    const fileName = path.basename(file.path);
    const tempFileName = `STAGED-${randomName(6)}-${fileName}`;
    // TODO: check file name conflict
    absPath = path.join(rs.tempdir, tempFileName);
  } else {
    // TODO: shorten path
    absPath = path.join(rs.tempdir, file.revspec, file.path);
    const parentDir = path.dirname(absPath);
    if (!(await fs.pathExists(parentDir))) {
      await fs.mkdirs(parentDir);
    }
  }
  if (await fs.pathExists(absPath)) {
    return absPath;
  }
  await saveTo(rs.repoPath, file, absPath);
  return absPath;
};

const replaceOrPush = (array: string[], value: string, newValue: string): void => {
  const index = array.indexOf(value);
  if (index < 0) {
    array.push(newValue);
  } else {
    array[index] = newValue;
  }
};

export const showExternalDiff: Handler<
  [{ repoPath: string; left: FileSpec; right: FileSpec }],
  void
> = async (_, { repoPath, left, right }): Promise<void> => {
  const rs = repositorySessions.prepare(repoPath);
  const externalDiffTool = config.data.externalDiffTool;
  if (!externalDiffTool) {
    return;
  }
  const [command, ...args] = splitCommandline(externalDiffTool);
  const [leftPath, rightPath] = await Promise.all([
    prepareDiffFile(rs, left),
    prepareDiffFile(rs, right)
  ]);
  replaceOrPush(args, "%1", leftPath);
  replaceOrPush(args, "%2", rightPath);
  cp.spawn(command, args, {
    detached: true,
    shell: true,
    stdio: "ignore"
  }).unref();
};
