import { getWorkingTreeStatAsync, getUntrackedFilesAsync } from "inazuma-rust-backend";

export async function status(repository: string): Promise<WorkingTreeStat> {
  const [untrackedFiles, unstagedFiles, stagedFiles] = await Promise.all([
    getUntrackedFilesAsync(repository),
    getWorkingTreeStatAsync(repository, false),
    getWorkingTreeStatAsync(repository, true)
  ]);
  return {
    id: "--",
    untrackedFiles,
    unstagedFiles,
    stagedFiles
  };
}
