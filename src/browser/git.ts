///<reference path="./nodegit.d.ts" />
import * as ngit from "nodegit";

const repos: { [path: string]: ngit.Repository } = {};

function openRepo(path: string): Promise<ngit.Repository> {
    if (path in repos) {
        return Promise.resolve(repos[path]);
    }
    else {
        return ngit.Repository.open(path).then(repo => {
            repos[path] = repo;
            return repo;
        });
    }
}

export function fetchHistory(repoPath: string, num: number): Promise<ngit.Commit[]> {
    return openRepo(repoPath).then(repo => {
        return repo.getHeadCommit().then(head => ( { repo, head } ));
    }).then(item => {
        const { repo, head } = item;
        const rw = ngit.Revwalk.create(repo);
        rw.sorting(ngit.Revwalk.SORT.TOPOLOGICAL);
        rw.push(head.id());
        return rw.getCommits(num);
    });
}
