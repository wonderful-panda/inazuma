import { exec } from "./exec";

interface LogKeyword {
  name: string;
  format: string;
  proc: (commit: Commit, value: string) => void;
}

const _logKeywords: LogKeyword[] = [
  {
    name: "id",
    format: "%H",
    proc: (c, v) => {
      c.id = v;
    }
  },
  {
    name: "parents",
    format: "%P",
    proc: (c, v) => {
      c.parentIds = v.split(" ");
    }
  },
  {
    name: "author",
    format: "%an",
    proc: (c, v) => {
      c.author = v;
    }
  },
  {
    name: "date",
    format: "%at",
    proc: (c, v) => {
      c.date = parseInt(v) * 1000;
    }
  },
  {
    name: "summary",
    format: "%s",
    proc: (c, v) => {
      c.summary = v;
    }
  }
];

const _logFormat = _logKeywords.map(k => `${k.name} ${k.format}`).join("%n");
const _procMap: {
  [name: string]: (commit: Commit, value: string) => void;
} = {};
_logKeywords.forEach(k => {
  _procMap[k.name] = k.proc;
});

const _lastKeywordName = _logKeywords[_logKeywords.length - 1].name;

export async function log(
  repository: string,
  maxCount: number,
  heads: string[],
  commitCb: (c: Commit) => any
): Promise<number> {
  /* Output format

     |id <hash>
     |parents <parent hashes separated by blank>
     |author <author>
     |date <author date (milliseconds from epoc)>
     |summary <summary>

     */

  const args = [...heads, "--topo-order", `--format=${_logFormat}`];
  if (maxCount > 0) {
    args.push(`-${maxCount}`);
  }
  let current = {} as Commit;
  let commitCount = 0;
  await exec("log", {
    repository,
    args,
    onEachLine: line => {
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
    }
  });
  return commitCount;
}

export async function filelog(
  repository: string,
  maxCount: number,
  heads: string[],
  path: string,
  commitCb: (c: FileCommit) => any
): Promise<number> {
  /* Output format
     |
     |id <hash>
     |parents <parent hashes separated by blank>
     |author <author>
     |date <author date (milliseconds from epoc)>
     |summary <summary>
     |<NUL>
     |STAT LINE

     |STAT LINE is one of them:
     |status code<NUL>path<NUL>
     |R###<NUL>old path<NUL>path<NUL>
     */

  const args = [
    ...heads,
    "--topo-order",
    `--format=%n${_logFormat}%nstat `,
    "--follow",
    "--name-status",
    "-z"
  ];
  if (maxCount > 0) {
    args.push(`-${maxCount}`);
  }
  args.push("--", path);
  let current = {} as FileCommit;
  let commitCount = 0;
  let region: "PROPS" | "STAT" = "PROPS";
  await exec("log", {
    repository,
    args,
    onEachLine: line => {
      if (line.length === 0) {
        return;
      }
      if (region === "PROPS") {
        const p = line.indexOf(" ");
        if (p <= 0) {
          console.log("log/unexpected output:", line);
          return;
        }
        const name = line.slice(0, p);
        if (name === "stat") {
          region = "STAT";
          return;
        }
        const proc = _procMap[name];
        if (!proc) {
          console.log("log/unexpected output:", line);
          return;
        }
        proc(current, line.slice(p + 1));
      } else {
        // stat line
        const tokens = line.split("\0");
        current.statusCode = tokens[0];
        if (current.statusCode.startsWith("R")) {
          current.oldPath = tokens[1];
          current.path = tokens[2];
        } else {
          current.path = tokens[1];
        }
        commitCount++;
        commitCb(current);
        current = {} as FileCommit;
        region = "PROPS";
      }
    }
  });
  return commitCount;
}

const _commitDetailFormat = _logFormat + "%nbody {{{%n%w(0,1,1)%b%n%w(0)}}}%n";

export async function getCommitDetail(
  repository: string,
  commitId: string
): Promise<CommitDetail> {
  /* Output format

     |id <hash>
     |parents <parent hashes separated by blank>
     |author <author>
     |date <author date (milliseconds from epoc)>
     |summary <summary>
     |body {{{
     | <body>
     | <indented>
     | <by>
     | <blank>
     |}}}
     |
     |M<NUL>dir/foo.txt<NUL>A<NUL>dir/bar.txt<NUL>R100<NUL>dir/baz-new.txt<NUL>dir/baz-old.txt...

     */
  const args = [
    commitId,
    "--name-status",
    "--find-renames",
    "-z",
    `--format=${_commitDetailFormat}`
  ];
  const ret = { body: "", files: [] as FileEntry[] } as CommitDetail;
  let region: "PROPS" | "BODY" | "FILES" = "PROPS";
  await exec("show", {
    repository,
    args,
    onEachLine: line => {
      if (region === "PROPS") {
        // read props of commit (id, parents, author, date, summary)
        const p = line.indexOf(" ");
        if (p <= 0) {
          console.log("show/unexpected output:", line);
          return;
        }
        const name = line.slice(0, p);
        if (name === "body") {
          region = "BODY";
          return;
        }
        const proc = _procMap[name];
        if (!proc) {
          console.log("show/unexpected output:", line);
          return;
        }
        proc(ret, line.slice(p + 1));
      } else if (region === "BODY") {
        // read body of commit
        if (line === "}}}") {
          ret.body = ret.body.replace(/\n$/, "");
          region = "FILES";
          return;
        }
        if (line.length === 0) {
          console.log("show/unexpected output:", line);
          return;
        }
        ret.body += line.slice(1) + "\n";
      } else {
        if (line === "") {
          return;
        }
        const tokens = line.split("\0");
        for (let i = 0; i < tokens.length; ++i) {
          const statusCode = tokens[i];
          if (statusCode.startsWith("R")) {
            // rename
            ret.files.push({
              path: tokens[i + 2],
              oldPath: tokens[i + 1],
              statusCode
            });
            i += 2;
          } else if (statusCode) {
            ret.files.push({ path: tokens[i + 1], statusCode });
            i += 1;
          } else {
            break;
          }
        }
      }
    }
  });
  return ret;
}
