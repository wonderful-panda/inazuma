import * as chardet from "chardet";
import * as iconv from "iconv-lite";
import { exec } from "./exec";
import { catFile } from "./file";
import { filelog } from "./log";

export async function blame(
  repository: string,
  relPath: string,
  sha: string
): Promise<Blame> {
  const headerPattern = /^([a-f0-9]{40}) \d+ (\d+) (\d+)$/;
  const commitIds: string[] = [];
  const commits: FileCommit[] = [];
  const promiseFileLog = filelog(repository, 1000, [sha], relPath, c =>
    commits.push(c)
  );
  const promiseContent = catFile(repository, relPath, sha);
  const promiseBlame = exec("blame", {
    repository,
    args: [sha, "--incremental", "--", relPath],
    onEachLine: line => {
      const match = line.match(headerPattern);
      if (match) {
        const commitId = match[1];
        let lineNo = parseInt(match[2]);
        let lineCount = parseInt(match[3]);
        while (lineCount--) {
          commitIds[lineNo++] = commitId;
        }
      } else {
        // do nothing
      }
    }
  });
  const [content, ,] = await Promise.all([
    promiseContent,
    promiseFileLog,
    promiseBlame
  ]);
  const encoding = (chardet.detect(content) as string) || "utf8";
  return {
    commits,
    commitIds,
    content: { text: iconv.decode(content, encoding), encoding }
  };
}
