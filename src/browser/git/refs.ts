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

function parseShowRefLine(
  line: string,
  currentBranch: string
): Ref | undefined {
  const p = line.indexOf(" ");
  if (p <= 0) {
    return undefined;
  }
  const id = line.slice(0, p);
  const fullname = line.slice(p + 1);
  const refNameComponents = fullname.split("/");
  let type = refNameComponents.shift();
  if (type === "HEAD") {
    return { fullname, type, id };
  } else if (type === "refs") {
    type = refNameComponents.shift();
    if (type === "heads") {
      const name = refNameComponents.join("/");
      const current = fullname === currentBranch;
      return { fullname, type, name, id, current };
    } else if (type === "tags") {
      const name = refNameComponents.join("/");
      return { fullname, type, name, id };
    } else if (type === "remotes") {
      const remote = refNameComponents.shift();
      if (remote) {
        const name = refNameComponents.join("/");
        return { fullname, type, remote, name, id };
      } else {
        throw new Error("show-ref: Unexpected output: " + line);
      }
    }
  } else {
    throw new Error("show-ref: Unexpected output: " + line);
  }
}

export async function getRefs(repository: string): Promise<Refs> {
  const refs: Refs = {
    mergeHeads: [],
    remotes: {},
    heads: [],
    tags: [],
    refsById: {}
  };
  // if HEAD is detached, `git symbolic-ref HEAD -q` returns non zero.
  const ret = await exec("symbolic-ref", {
    repository,
    args: ["HEAD", "-q"],
    allowNonZeroExitCode: true
  });
  const currentBranch =
    ret.exitCode === 0 ? ret.stdout.toString("utf8").replace(/\n$/, "") : "";
  const { stdout } = await exec("show-ref", {
    repository,
    args: ["--head", "--dereference"]
  });
  const lines = stdout.toString("utf8").split("\n");
  const refList = lines.map(line => parseShowRefLine(line, currentBranch));
  refList.forEach((ref, index) => {
    if (!ref) {
      return;
    }
    if (ref.type === "tags") {
      if (ref.name.endsWith("^{}")) {
        addRef(refs, { ...ref, name: ref.name.slice(0, -3) });
      } else {
        const next = refList[index + 1];
        if (next && next.type === "tags" && next.name === ref.name + "^{}") {
          // skip annotated tag (Add dereferenced tag instead)
          return;
        }
        addRef(refs, ref);
      }
    } else {
      addRef(refs, ref);
    }
  });
  // Get merge head list from .git/MERGE_HEAD
  const mergeHeadsFile = path.join(repository, ".git/MERGE_HEAD");
  if (await fs.pathExists(mergeHeadsFile)) {
    const type = "MERGE_HEAD";
    const data = await fs.readFile(mergeHeadsFile);
    data
      .toString()
      .replace(/\n$/, "")
      .split("\n")
      .forEach((id, index) =>
        addRef(refs, { fullname: `MERGE_HEAD/${index}`, type, id })
      );
  }
  return refs;
}
