import * as fs from "fs-extra";
import * as path from "path";
import * as chardet from "chardet";
import * as iconv from "iconv-lite";
import { getContentAsync, saveToAsync } from "inazuma-rust-backend";

export async function catFile(repository: string, file: FileSpec): Promise<Buffer> {
  if (file.revspec === "UNSTAGED") {
    const abspath = path.join(repository, file.path);
    return fs.readFile(abspath);
  }
  const content = await getContentAsync(repository, file.path, file.revspec);
  return content;
}

export async function getTextFileContent(repository: string, file: FileSpec): Promise<TextFile> {
  const buffer = await catFile(repository, file);
  const encoding = chardet.detect(buffer) || "utf8";
  const content = iconv.decode(buffer, encoding);
  return { ...file, encoding, content };
}

export async function saveTo(repository: string, file: FileSpec, destPath: string): Promise<void> {
  if (file.revspec === "UNSTAGED") {
    const abspath = path.join(repository, file.path);
    await fs.copyFile(abspath, destPath);
  }
  await saveToAsync(repository, file.path, file.revspec, destPath);
}
