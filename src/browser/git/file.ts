import * as fs from "fs-extra";
import { exec } from "./exec";

export async function catFile(
  repository: string,
  relPath: string,
  sha: string
): Promise<Buffer> {
  const target = `${sha === "STAGED" ? "" : sha}:${relPath}`;
  const { stdout } = await exec("show", {
    repository,
    args: ["-p", target]
  });
  return stdout;
}

export async function saveTo(
  repository: string,
  relPath: string,
  sha: string,
  destPath: string
): Promise<void> {
  const stdout = await catFile(repository, relPath, sha);
  await fs.writeFile(destPath, stdout);
}
