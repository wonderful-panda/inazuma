import {
  getWorkingTreeStatAsync,
  getUntrackedFilesAsync,
  getWorkingTreeParentsAsync
} from "inazuma-rust-backend";

export async function status(repository: string): Promise<WorkingTreeStat> {
  const [untrackedFiles, unstagedFiles, stagedFiles, parentIds] = await Promise.all([
    getUntrackedFilesAsync(repository),
    getWorkingTreeStatAsync(repository, false),
    getWorkingTreeStatAsync(repository, true),
    getWorkingTreeParentsAsync(repository)
  ]);
  return {
    id: "--",
    parentIds,
    untrackedFiles,
    unstagedFiles,
    stagedFiles
  };
}
