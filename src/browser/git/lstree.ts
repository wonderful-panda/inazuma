import { exec } from "./exec";
import * as path_ from "path";

export async function lsTree(
  repository: string,
  sha: string
): Promise<LsTreeEntry[]> {
  const parents = {} as Dict<LsTreeEntry[]>;
  parents["."] = [];
  const re = /^[0-9]+ (blob|tree) [^ ]+\t(.*)$/;
  await exec("ls-tree", {
    repository,
    args: ["-r", "-t", sha],
    configs: ["core.quotePath=false"],
    onEachLine: line => {
      const m = re.exec(line);
      if (!m) {
        return;
      }
      const type = m[1] === "tree" ? "tree" : "blob";
      const path = m[2];
      const parent = path_.dirname(path);
      const entry: LsTreeEntry = { data: { path, type } };
      if (type === "tree") {
        parents[path] = entry.children = [];
      }
      parents[parent].push(entry);
    }
  });
  return parents["."];
}
