import { logAsync, refsAsync } from "inazuma-rust-backend";
import type { Handler } from ".";

const getRefs = async (repoPath: string): Promise<Refs> => {
  const refs: Refs = {
    ...(await refsAsync(repoPath)),
    refsById: {}
  };
  if (refs.head) {
    refs.refsById[refs.head] = [{ id: refs.head, type: "HEAD", fullname: "HEAD" }];
  }
  const remotes = Object.values(refs.remotes).reduce((prev, cur) => {
    prev.push(...cur);
    return prev;
  }, [] as Ref[]);
  const sortedHeads = refs.heads.sort((a, b) => {
    if (a.current) {
      return -1;
    } else if (b.current) {
      return 1;
    } else {
      return a.name.localeCompare(b.name);
    }
  });
  for (const r of [...sortedHeads, ...refs.tags, ...remotes]) {
    (refs.refsById[r.id] || (refs.refsById[r.id] = [])).push(r);
  }
  return refs;
};

const getWtreePseudoCommit = (headId: string | undefined, mergeHeads: string[]): Commit => ({
  id: "--",
  parentIds: headId ? [headId, ...mergeHeads] : mergeHeads,
  author: "--",
  summary: "<Working tree>",
  date: new Date().getTime()
});

const fetchHistory = async (
  repoPath: string,
  num: number
): Promise<{ commits: Commit[]; refs: Refs }> => {
  const [refs, commits] = await Promise.all([getRefs(repoPath), logAsync(repoPath, num)]);
  if (refs.head) {
    commits.unshift(getWtreePseudoCommit(refs.head, refs.mergeHeads));
  }
  return { commits, refs };
};

export const openRepository: Handler<[string], { commits: Commit[]; refs: Refs }> = (_, repoPath) =>
  fetchHistory(repoPath, 1000);
