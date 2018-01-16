import * as fs from "fs-extra";
import { exec } from "./exec";

export async function saveTo(
  repository: string,
  relPath: string,
  sha: string,
  destPath: string
): Promise<void> {
  const target = `${sha === "STAGED" ? "" : sha}:${relPath}`;
  const { stdout } = await exec("show", {
    repository,
    args: ["-p", target]
  });
  await fs.writeFile(destPath, stdout);
}
