/* eslint-disable @typescript-eslint/no-unsafe-return */
import { blue, green, grey, red } from "@mui/material/colors";
import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { getExtension } from "@/util";

let initialized = false;

export const setup = () => {
  if (initialized) {
    return;
  }
  initialized = true;
  (self as unknown as Record<string, unknown>).MonacoEnvironment = {
    getWorker(_: unknown, label: string) {
      if (label === "json") {
        return jsonWorker();
      } else if (label === "css" || label === "scss" || label === "less") {
        return cssWorker();
      } else if (label === "html" || label === "handlebars" || label === "razor") {
        return htmlWorker();
      } else if (label === "typescript" || label === "javascript") {
        return tsWorker();
      } else {
        return editorWorker();
      }
    }
  };
  // register syntax highlight for unified-diff
  monaco.languages.register({ id: "unified-diff" });
  monaco.languages.setMonarchTokensProvider("unified-diff", {
    tokenizer: {
      root: [
        [/^@@.*@@.*/, "diff-marker"],
        [/^<<.*>>/, "diff-invalid"],
        [/^\+.*/, "diff-added"],
        [/^-.*/, "diff-deleted"]
      ]
    }
  });
  monaco.editor.defineTheme("inazuma-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "diff-marker", foreground: blue[600], fontStyle: "bold" },
      { token: "diff-invalid", foreground: grey[600], fontStyle: "bold" },
      { token: "diff-added", foreground: green[400] },
      { token: "diff-deleted", foreground: red[300] }
    ],
    colors: {}
  });
  monaco.editor.setTheme("inazuma-dark");

  const { typescript, json, css } = monaco.languages;
  for (const d of [typescript.typescriptDefaults, typescript.javascriptDefaults]) {
    d.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true
    });
  }

  json.jsonDefaults.setDiagnosticsOptions({
    validate: false
  });

  for (const d of [css.cssDefaults, css.lessDefaults, css.scssDefaults]) {
    d.setOptions({ validate: false });
  }
};

let langIdMap: Record<string, string>;

export function getLangIdFromPath(path: string): string {
  if (!langIdMap) {
    langIdMap = {};
    for (const lang of monaco.languages.getLanguages()) {
      if (lang.extensions) {
        for (const ext of lang.extensions) {
          langIdMap[ext.toLowerCase()] = lang.id;
        }
      }
    }
  }
  const ext = getExtension(path).toLowerCase();
  return langIdMap[ext] ?? "plaintext";
}

/**
 * Make range list from line index list
 *
 * for example:
 *  [1, 2, 4, 5, 6, 8] => [(1 to 2), (4 to 6), (8 to 8)]
 *
 */
export function lineNumbersToRanges(lineNumbers: readonly number[]): monaco.IRange[] {
  const ret: monaco.IRange[] = [];
  let startLineNumber = -1;
  let endLineNumber = -1;
  for (let i = 0; i < lineNumbers.length + 1; ++i) {
    const lineNumber = lineNumbers[i]!; // index is 0-based, lineNumber is 1-based
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
