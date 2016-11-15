///<reference path="./nodegit.d.ts" />
import * as ngit from "nodegit";

const repos: { [path: string]: ngit.Repository } = {};

async function openRepo(path: string): Promise<ngit.Repository> {
    if (path in repos) {
        return repos[path];
    }
    const repo = repos[path] = await ngit.Repository.open(path + "/.git");
    return repo;
}

export async function fetchHistory(repoPath: string, num: number): Promise<ngit.Commit[]> {
    const repo = await openRepo(repoPath);
    const head = await repo.getHeadCommit();
    const rw = ngit.Revwalk.create(repo);
    rw.sorting(ngit.Revwalk.SORT.TOPOLOGICAL);
    rw.push(head.id());
    return await rw.getCommits(num);
}

export async function getCommitDetail(repoPath: string, sha: string): Promise<{ commit: ngit.Commit, patches: ngit.ConvenientPatch[] }> {
    const repo = await openRepo(repoPath);
    const commit = await repo.getCommit(sha);
    const diff = (await commit.getDiff())[0];
    const patches = await diff.patches();
    return { commit, patches };
}
