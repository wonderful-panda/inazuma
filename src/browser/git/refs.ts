import * as path from "path";
import * as fs from "fs-extra";
import { exec, tryExec } from "./process";

function addRef(refs: Refs, r: Ref): void {
    (refs.refsById[r.id] || (refs.refsById[r.id] = [])).push(r);
    switch (r.type) {
        case "HEAD":
            refs.head = r.id;
            break;
        case "MERGE_HEAD":
            refs.mergeHeads.push(r.id);
            break;
        case "heads":
            refs.heads[r.name] = r.id;
            break;
        case "remotes":
            (refs.remotes[r.remote] || (refs.remotes[r.remote] = {}))[r.name] = r.id;
            break;
        case "tags":
            refs.tags[r.name] = r.id;
            break;
        default:
            throw "Unknown ref type";
    }
}

export async function getRefs(repoPath: string): Promise<Refs> {
    const refs: Refs = {
        mergeHeads: [],
        remotes: {},
        heads: {},
        tags: {},
        refsById: {}
    };
    // if HEAD is detached, `git symbolic-ref HEAD -q` returns non zero.
    const ret = await tryExec(repoPath, "symbolic-ref", ["HEAD", "-q"]);
    const currentBranch = ret.exitCode === 0 ? ret.stdout.replace(/\n$/, "") : "";
    await exec(repoPath, "show-ref", ["--head"], line => {
        const p = line.indexOf(" ");
        if (p <= 0) {
            return;
        }
        const id = line.slice(0, p);
        const fullname = line.slice(p + 1);
        const refNameComponents = fullname.split("/");
        let type = refNameComponents.shift();
        if (type === "HEAD") {
            addRef(refs, { fullname, type, id });
        }
        else if (type === "refs") {
            let type = refNameComponents.shift();
            let name: string;
            switch (type) {
                case "heads":
                    name = refNameComponents.join("/");
                    addRef(refs, { fullname, type, name, id, current: (fullname === currentBranch) });
                    break;
                case "tags":
                    name = refNameComponents.join("/");
                    addRef(refs, { fullname, type, name, id });
                    break;
                case "remotes":
                    const remote = refNameComponents.shift();
                    if (remote) {
                        name = refNameComponents.join("/");
                        addRef(refs, { fullname, type, remote, name, id });
                    }
                    break;
                default:
                    // TODO: handle unexpected line
                    break;
            }
            return;
        }
        else {
            // TODO: handle unexpected line
        }
    });
    // Get merge head list from .git/MERGE_HEAD
    const mergeHeadsFile = path.join(repoPath, ".git/MERGE_HEAD");
    if (await fs.exists(mergeHeadsFile)) {
        const type = "MERGE_HEAD";
        const data = await fs.readFile(mergeHeadsFile);
        data.toString().replace("\n$", "").split("\n").forEach(
            (id, index) => addRef(refs, { fullname: `MERGE_HEAD/${ index }`, type, id })
        );
    }
    return refs;
}
