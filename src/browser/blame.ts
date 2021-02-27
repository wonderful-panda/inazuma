import { getTextFileContent } from "./file";
import { blameAsync, filelogAsync } from "inazuma-rust-backend";

export async function blame(repository: string, relPath: string, sha: string): Promise<Blame> {
  const promiseFileLog = filelogAsync(repository, relPath, 1000, [sha]);
  const promiseContent = getTextFileContent(repository, { path: relPath, revspec: sha });
  const promiseBlame = (async () => {
    const commitIds: string[] = [];
    const entries = await blameAsync(repository, relPath, sha);
    for (const entry of entries) {
      for (const line of entry.lineNo) {
        commitIds[line - 1] = entry.id;
      }
    }
    return commitIds;
  })();
  const [content, commits, commitIds] = await Promise.all([
    promiseContent,
    promiseFileLog,
    promiseBlame
  ]);
  return {
    commits,
    commitIds,
    content: { text: content.content, encoding: content.encoding }
  };
}
