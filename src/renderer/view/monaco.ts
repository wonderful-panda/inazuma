import { getExtension } from "../core/utils";

const langMap = new Map<string, string>();

export function loadMonaco() {
  const { amdRequire } = global as any;
  amdRequire(["vs/editor/editor.main"], () => {
    monaco.languages.getLanguages().forEach(lang => {
      if (lang.extensions) {
        lang.extensions.forEach(ext => langMap.set(ext.toLowerCase(), lang.id));
      }
    });
  });
}

/**
 * Make range list from line index list
 *
 * for example:
 *  [0, 1, 2, 4, 5, 8] => [(1 to 3), (5 to 6), (8 to 8)]
 *
 * NOTE: line index is 0-based value, line number is 1-based value.
 */
export function lineIndicesToRanges(
  lineInidices: ReadonlyArray<number>
): monaco.IRange[] {
  const ret: monaco.IRange[] = [];
  let startLineNumber = -1;
  let endLineNumber = -1;
  for (let i = 0; i < lineInidices.length + 1; ++i) {
    const lineNumber = lineInidices[i] + 1; // index is 0-based, lineNumber is 1-based
    if (endLineNumber + 1 === lineNumber) {
      endLineNumber = lineNumber;
    } else {
      if (0 <= startLineNumber) {
        ret.push(new monaco.Range(startLineNumber, 1, endLineNumber, 1));
      }
      startLineNumber = endLineNumber = lineNumber;
    }
  }
  return ret;
}

export function getLangIdFromPath(path: string): string {
  const ext = getExtension(path).toLowerCase();
  return langMap.get(ext) || "plaintext";
}
