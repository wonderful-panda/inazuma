import * as path from "path";
import * as fs from "fs-extra";
import { exec } from "./process";

export class Refs {
    private readonly _idMap: { [id: string]: Ref[] } = {};
    readonly head?: string;
    readonly mergeHeads: string[] = [];
    readonly remotes: { [remote: string]: { [name: string]: string } } = {};
    readonly heads: { [name: string]: string } = {};
    readonly tags: { [name: string]: string } = {};

    constructor(refs: Ref[]) {
        let head: string;
        refs.forEach(ref => {
            const refsOfId = this._idMap[ref.id] || (this._idMap[ref.id] = []);
            refsOfId.push(ref);
            switch (ref.type) {
                case "HEAD":
                    head = ref.id;
                    break;
                case "MERGE_HEAD":
                    this.mergeHeads.push(ref.id);
                    break;
                case "heads":
                    this.heads[ref.name] = ref.id;
                    break;
                case "tags":
                    this.tags[ref.name] = ref.id;
                    break;
                case "remotes":
                    const remote = this.remotes[ref.remote] || (this.remotes[ref.remote] = {});
                    remote[ref.name] = ref.id;
                    break;
                default:
                    throw "Invalid ref type";
            }
        });
        this.head = head;
    }

    getRefsById(id: string): Ref[] {
        return this._idMap[id];
    }
}

export async function getRefs(repoPath: string): Promise<Refs> {
    const refs: Ref[] = [];
    await exec(repoPath, "show-ref", ["--head"], line => {
        const p = line.indexOf(" ");
        if (p <= 0) {
            return;
        }
        const id = line.slice(0, p);
        const refNameComponents = line.slice(p + 1).split("/");
        let type = refNameComponents.shift();
        if (type === "HEAD") {
            refs.push({ type, id });
        }
        else if (type === "refs") {
            let type = refNameComponents.shift();
            let name: string;
            switch (type) {
                case "heads":
                case "tags":
                    name = refNameComponents.join("/");
                    refs.push({ type, name, id });
                    break;
                case "remotes":
                    const remote = refNameComponents.shift();
                    name = refNameComponents.join("/");
                    refs.push({ type, remote, name, id });
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
        data.toString().replace("\n$", "").split("\n").forEach(id => refs.push({ type, id }));
    }
    return new Refs(refs);
}
