import { exec } from "./exec";

/**
 * parse output generated with `--numstat --raw -z`
 *
 *  Raw output format  https://git-scm.com/docs/git-diff#_raw_output_format
      in-place edit  :100644 100644 bcd1234 0123456 M<NUL>file0<NUL>
      copy-edit      :100644 100644 abcd123 1234567 C68<NUL>file1<NUL>file2<NUL>
      rename-edit    :100644 100644 abcd123 1234567 R86<NUL>file1<NUL>file3<NUL>
      create         :000000 100644 0000000 1234567 A<NUL>file4<NUL>
      delete         :100644 000000 1234567 0000000 D<NUL>file5<NUL>
      unmerged       :000000 000000 0000000 0000000 U<NUL>file6<NUL>
 *
 *  Numstat output format
 *    rename/copy    insertions<TAB>deletions<NUL>old path<NUL>new path<NUL>
 *    others         insertions<TAB>deletions<TAB>path<NUL>
 *
 *    insersions/deletions are inserted/deleted line count, or "-" when it is binary.
 */
export function parseNumstatRaw(text: string): readonly FileEntry[] {
  const tokens = text.split("\0");

  const files = new Map<string, FileEntry>();
  for (let i = 0; i < tokens.length; ++i) {
    const token = tokens[i];
    if (!token) {
      break;
    }
    if (token.startsWith(":")) {
      // RAW OUTPUT
      const statusCode = token.split(" ")[4];
      const status = statusCode[0];
      if (status === "M" || status === "A" || status === "D" || status === "T" || status === "U") {
        const path = tokens[i + 1];
        files.set(path, { path, statusCode });
        i += 1;
      } else if (status === "R" || status === "C") {
        const oldPath = tokens[i + 1];
        const path = tokens[i + 2];
        i += 2;
        files.set(path, { path, oldPath, statusCode });
      } else {
        throw new Error("show/unexpected output: " + token);
      }
    } else {
      // NUMSTAT OUTPUT
      const [insertions, deletions, path] = token.split("\t");
      let file: FileEntry | undefined;
      if (!path) {
        // copied or renamed
        file = files.get(tokens[i + 2]);
        i += 2;
      } else {
        file = files.get(path);
      }
      if (!file) {
        throw new Error("show/unexpected output: " + token);
      }
      file.insertions = insertions === "-" ? "-" : parseInt(insertions);
      file.deletions = deletions === "-" ? "-" : parseInt(deletions);
    }
  }

  return [...files.values()];
}

export async function getWorkingTreeStat(
  repository: string,
  cached: boolean
): Promise<readonly FileEntry[]> {
  const args = ["--raw", "--numstat", "--find-renames", "-z"];
  if (cached) {
    args.push("--cached");
  }
  const { stdout } = await exec("diff", { args, repository });
  const lines = stdout.toString("utf8").split("\n");
  const files = parseNumstatRaw(lines[0]);
  for (const f of files) {
    if (cached) {
      f.inIndex = true;
    } else {
      f.inWorkingTree = true;
    }
  }
  return files;
}
