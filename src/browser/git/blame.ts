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
  let currentCommit: BlameCommit = {
    id: "",
    author: "",
    date: 0,
    summary: "",
    filename: "",
    boundary: false
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
            summary: "",
            filename: "",
            boundary: false
          };
          commits.push(currentCommit);
        }
        let lineNo = parseInt(match[2]);
        let lineCount = parseInt(match[3]);
        while (lineCount--) {
          commitIds[lineNo++] = commitId;
        }
      } else if (line === "boundary") {
        currentCommit.boundary = true;
      } else {
        const p = line.indexOf(" ");
        if (p < 0) {
          return;
        }
        const key = line.slice(0, p);
        const value = line.slice(p + 1);
        switch (key) {
          case "author":
          case "summary":
          case "filename":
            currentCommit[key] = value;
            break;
          case "author-time":
            currentCommit.date = parseInt(value) * 1000;
            break;
          case "previous":
            const values = value.split(" ");
            currentCommit.previous = values[0];
            currentCommit.previousFilename = values[1];
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
