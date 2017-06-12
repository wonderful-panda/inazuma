import { exec } from "./process";

interface LogKeyword {
    name: string;
    format: string;
    proc: (commit: Commit, value: string) => void;
}

const _logKeywords: LogKeyword[] = [
    { name: "id", format: "%H", proc: (c, v) => { c.id = v } },
    { name: "parents", format: "%P", proc: (c, v) => { c.parentIds = v.split(" ") } },
    { name: "author", format: "%an", proc: (c, v) => { c.author = v } },
    { name: "date", format: "%at", proc: (c, v) => { c.date = parseInt(v) * 1000 } },
    { name: "summary", format: "%s", proc: (c, v) => { c.summary = v } },
];

const _logFormat = _logKeywords.map(k => `${ k.name } ${ k.format }`).join("%n");
const _procMap: { [name: string]: (commit: Commit, value: string) => void } = {};
_logKeywords.forEach(k => _procMap[k.name] = k.proc);

const _lastKeywordName = _logKeywords[_logKeywords.length - 1].name;

export async function log(repoPath: string, maxCount: number, commitCb: (c: Commit) => any): Promise<number> {
    const args = [`--format=${ _logFormat }`];
    if (maxCount > 0) {
        args.push(`-${ maxCount }`);
    }
    let current = {} as Commit;
    let commitCount = 0;
    const ret = await exec(repoPath, "log", args, line  => {
        const p = line.indexOf(" ");
        if (p <= 0) {
            console.log("log/unexpected output:", line);
            return;
        }
        const name = line.slice(0, p);
        const proc = _procMap[name];
        if (!proc) {
            console.log("log/unexpected output:", line);
            return;
        }
        proc(current, line.slice(p + 1));
        if (name === _lastKeywordName) {
            commitCount++;
            commitCb(current);
            current = {} as Commit;
        }
    });
    return commitCount;
}

export async function getHeadCommit(repoPath: string): Promise<string> {
    const { stdout } = await exec(repoPath, "rev-parse", ["HEAD"]);
    return stdout.split("\n")[0];
}
