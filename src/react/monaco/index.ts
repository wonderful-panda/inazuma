import { getExtension } from "@/util";
import * as monaco from "monaco-editor";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

let initialized = false;

export const setup = () => {
  if (initialized) {
    return;
  }
  initialized = true;
  (self as any).MonacoEnvironment = {
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
  monaco.editor.setTheme("vs-dark");

  const { typescript, json, css } = monaco.languages;
  [typescript.typescriptDefaults, typescript.javascriptDefaults].forEach((d) => {
    d.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true
    });
  });

  json.jsonDefaults.setDiagnosticsOptions({
    validate: false
  });

  [css.cssDefaults, css.lessDefaults, css.scssDefaults].forEach((d) =>
    d.setDiagnosticsOptions({ validate: false })
  );
};

let langIdMap: Record<string, string>;

export function getLangIdFromPath(path: string): string {
  if (!langIdMap) {
    langIdMap = {};
    monaco.languages.getLanguages().forEach((lang) => {
      if (lang.extensions) {
        lang.extensions.forEach((ext) => (langIdMap[ext.toLowerCase()] = lang.id));
      }
    });
  }
  const ext = getExtension(path).toLowerCase();
  return langIdMap[ext] || "plaintext";
}

/**
 * Make range list from line index list
 *
 * for example:
 *  [1, 2, 4, 5, 6, 8] => [(1 to 2), (4 to 6), (8 to 8)]
 *
 */
export function lineNumbersToRanges(lineNumbers: ReadonlyArray<number>): monaco.IRange[] {
  const ret: monaco.IRange[] = [];
  let startLineNumber = -1;
  let endLineNumber = -1;
  for (let i = 0; i < lineNumbers.length + 1; ++i) {
    const lineNumber = lineNumbers[i]; // index is 0-based, lineNumber is 1-based
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
