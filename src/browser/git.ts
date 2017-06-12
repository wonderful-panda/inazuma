///<reference path="./nodegit.d.ts" />
import * as ngit from "nodegit";

export class Repository {
    _head?: ngit.Commit = undefined;
    _status?: ngit.StatusFile[] = undefined;

    constructor(private _repo: ngit.Repository) {
    }

    invalidateCache() {
        this._head = undefined;
        this._status = undefined;
    }

    async refreshCacheIfHeadMoved() {
        const head = await this._repo.getHeadCommit();
        if (!this._head || this._head.sha() !== head.sha()) {
            this._head = head;
            this._status = undefined;
        }
    }

    async getStatus(): Promise<ngit.StatusFile[]> {
        await this.refreshCacheIfHeadMoved();
        if (!this._status) {
            this._status = await this._repo.getStatus();
        }
        return this._status;
    }

    async getCommitDetail(sha: string): Promise<{ commit: ngit.Commit, patches: ngit.ConvenientPatch[] }> {
        const commit = await this._repo.getCommit(sha);
        const diff = (await commit.getDiff())[0];
        const patches = await diff.patches();
        return { commit, patches };
    }
}

const repos: { [path: string]: Repository } = {};

export async function openRepo(path: string, invalidateCache: boolean): Promise<Repository> {
    if (path in repos) {
        const repo = repos[path];
        if (invalidateCache) {
            repo.invalidateCache();
        }
        return repo;
    }
    const rawRepo = await ngit.Repository.open(path + "/.git");
    const repo = repos[path] = new Repository(rawRepo);
    return repo;
}

