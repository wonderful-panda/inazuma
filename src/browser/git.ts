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
