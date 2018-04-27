import * as chardet from "chardet";
import * as iconv from "iconv-lite";
import { exec } from "./exec";
import { catFile } from "./file";

export async function blame(
  repository: string,
  relPath: string,
  sha: string
): Promise<Blame> {
  const headerPattern = /^([a-f0-9]{40}) \d+ (\d+) (\d+)$/;
  const commitIds: string[] = [];
  const commits: BlameCommit[] = [];
  let currentCommit = {
    id: "",
    author: "",
    date: 0,
    summary: ""
  };
  const promiseBlame = exec("blame", {
    repository,
    args: [sha, "--incremental", "--", relPath],
    onEachLine: line => {
      const match = line.match(headerPattern);
      if (match) {
        const commitId = match[1];
        if (currentCommit.id !== commitId) {
          currentCommit = {
            id: match[1],
            author: "",
            date: 0,
            summary: ""
          };
          commits.push(currentCommit);
        }
        let lineNo = parseInt(match[2]);
        let lineCount = parseInt(match[3]);
        while (lineCount--) {
          commitIds[lineNo++] = commitId;
        }
      } else {
        const p = line.indexOf(" ");
        if (p < 0) {
          return;
        }
        switch (line.slice(0, p)) {
          case "author":
            currentCommit.author = line.slice(p + 1);
            break;
          case "author-time":
            currentCommit.date = parseInt(line.slice(p + 1)) * 1000;
            break;
          case "summary":
            currentCommit.summary = line.slice(p + 1);
            break;
          default:
            break;
        }
      }
    }
  });
  const promiseContent = catFile(repository, relPath, sha);
  const [content] = await Promise.all([promiseContent, promiseBlame]);
  const encoding = (chardet.detect(content) as string) || "utf8";
  return {
    commits,
    commitIds,
    content: { text: iconv.decode(content, encoding), encoding }
  };
}
