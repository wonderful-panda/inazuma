import * as fs from "fs-extra";
import * as path from "path";
import * as chardet from "chardet";
import * as iconv from "iconv-lite";
import { exec } from "./exec";

export async function catFile(repository: string, file: FileSpec): Promise<Buffer> {
  if (file.revspec === "UNSTAGED") {
    const abspath = path.join(repository, file.path);
    return fs.readFile(abspath);
  }
  const target = `${file.revspec === "STAGED" ? "" : file.revspec}:${file.path}`;
  const { stdout } = await exec("show", {
    repository,
    args: ["-p", target]
  });
  return stdout;
}

export async function getTextFileContent(repository: string, file: FileSpec): Promise<TextFile> {
  const buffer = await catFile(repository, file);
  const encoding = chardet.detect(buffer) || "utf8";
  const content = iconv.decode(buffer, encoding);
  return { ...file, encoding, content };
}

export async function saveTo(repository: string, file: FileSpec, destPath: string): Promise<void> {
  const stdout = await catFile(repository, file);
  await fs.writeFile(destPath, stdout);
}
