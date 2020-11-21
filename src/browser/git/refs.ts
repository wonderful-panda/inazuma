import * as path from "path";
import * as fs from "fs-extra";
import { exec } from "./exec";

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
      refs.heads.push(r);
      break;
    case "remotes":
      (refs.remotes[r.remote] || (refs.remotes[r.remote] = [])).push(r);
      break;
    case "tags":
      refs.tags.push(r);
      break;
    default:
      throw new Error("Unknown ref type");
  }
}

function parseForEachRefLine(line: string): Ref | undefined {
  const tokens = line.split("\0");
  if (tokens.length !== 5) {
    throw new Error("for-each-ref: Unexpected output: " + line);
  }
  const [id, head, dereferenced, objectType, fullname] = tokens;
  const refNameComponents = fullname.split("/");
  let type = refNameComponents.shift();
  if (type === "HEAD") {
    return { fullname, type, id };
  } else if (type === "refs") {
    type = refNameComponents.shift();
    if (type === "heads") {
      const name = refNameComponents.join("/");
      const current = head === "*";
      return { fullname, type, name, id, current };
    } else if (type === "tags") {
      const name = refNameComponents.join("/");
      if (objectType === "tag") {
        return { fullname, type, name, id: dereferenced, tagId: id };
      } else {
        return { fullname, type, name, id, tagId: id };
      }
    } else if (type === "remotes") {
      const remote = refNameComponents.shift();
      if (remote) {
        const name = refNameComponents.join("/");
        return { fullname, type, remote, name, id };
      } else {
        throw new Error("for-each-ref: Unexpected output: " + line);
      }
    } else {
      return undefined;
    }
  } else {
    throw new Error("for-each-ref: Unexpected output: " + line);
  }
}

const SortOrder: { [key in Ref["type"]]: number } = {
  HEAD: 0,
  heads: 1,
  tags: 2,
  remotes: 3,
  MERGE_HEAD: 4
};

export async function getRefs(repository: string): Promise<Refs> {
  const refs: Refs = {
    mergeHeads: [],
    remotes: {},
    heads: [],
    tags: [],
    refsById: {}
  };
  await exec("for-each-ref", {
    repository,
    args: [
      "--sort",
      "-creatordate",
      "--format",
      "%(objectname)%00%(HEAD)%00%(*objectname)%00%(objecttype)%00%(refname)"
    ],
    onEachLine: (line) => {
      const ref = parseForEachRefLine(line);
      if (ref) {
        addRef(refs, ref);
        if (ref.type === "heads" && ref.current) {
          addRef(refs, { type: "HEAD", id: ref.id, fullname: "HEAD" });
        }
      }
    }
  });
  if (!refs.head) {
    // maybe HEAD is detached
    const ret = await exec("rev-parse", {
      repository,
      args: ["HEAD"],
      allowNonZeroExitCode: true
    });
    if (ret.exitCode === 0) {
      const headId = ret.stdout.toString("utf8").replace(/\n$/, "");
      addRef(refs, { type: "HEAD", id: headId, fullname: "HEAD" });
    }
  }
  // Get merge head list from .git/MERGE_HEAD
  const mergeHeadsFile = path.join(repository, ".git/MERGE_HEAD");
  if (await fs.pathExists(mergeHeadsFile)) {
    const type = "MERGE_HEAD";
    const data = await fs.readFile(mergeHeadsFile);
    data
      .toString()
      .replace(/\n$/, "")
      .split("\n")
      .forEach((id, index) => addRef(refs, { fullname: `MERGE_HEAD/${index}`, type, id }));
  }
  // sort each refsById entries
  Object.keys(refs.refsById).forEach((key) => {
    refs.refsById[key].sort((a, b) => SortOrder[a.type] - SortOrder[b.type]);
  });
  return refs;
}
