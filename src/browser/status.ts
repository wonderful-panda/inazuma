import {
  getWorkingTreeStatAsync,
  getUntrackedFilesAsync,
  getWorkingTreeParentsAsync
} from "inazuma-rust-backend";

export const getWtreePseudoCommit = (parentIds: string[]): Commit & { id: "--" } => ({
  id: "--",
  parentIds,
  author: "--",
  summary: "<Working tree>",
  date: new Date().getTime()
});

export async function status(repository: string): Promise<WorkingTreeStat> {
  const [untrackedFiles, unstagedFiles, stagedFiles, parentIds] = await Promise.all([
    getUntrackedFilesAsync(repository),
    getWorkingTreeStatAsync(repository, false),
    getWorkingTreeStatAsync(repository, true),
    getWorkingTreeParentsAsync(repository)
  ]);
  return {
    ...getWtreePseudoCommit(parentIds),
    untrackedFiles,
    unstagedFiles,
    stagedFiles
  };
}
