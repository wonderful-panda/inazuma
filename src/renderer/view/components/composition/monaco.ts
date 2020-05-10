import { lineNumbersToRanges } from "view/monaco";
import { Ref, watch } from "@vue/composition-api";

export function onHoveredLineNumberChanged(
  editor: monaco.editor.IStandaloneCodeEditor,
  handler: (lineNumber: number) => void
) {
  const onMouseMove = (e: monaco.editor.IEditorMouseEvent) => {
    if (e.target.position) {
      handler(e.target.position.lineNumber);
    } else {
      handler(0);
    }
  };
  const onMouseLeave = () => {
    handler(0);
  };
  editor.onMouseMove(onMouseMove);
  editor.onMouseLeave(onMouseLeave);
}

export function useDecoration(
  options: monaco.editor.IModelDecorationOptions
): {
  update: (
    editor: monaco.editor.IStandaloneCodeEditor | null,
    lineNumbers: readonly number[]
  ) => void;
} {
  let currentDecolationIds: string[] = [];
  return {
    update: (editor, lineNumbers) => {
      if (!editor) {
        return;
      }
      const ranges = lineNumbersToRanges(lineNumbers);
      const newDecorations = ranges.map(range => ({ range, options }));
      currentDecolationIds = editor.deltaDecorations(
        currentDecolationIds,
        newDecorations
      );
    }
  };
}

export type WatcherSource<T> = Readonly<Ref<T>> | (() => T);

function evaluateWatcherSource<T>(obj: WatcherSource<T>) {
  return "value" in obj ? obj.value : obj();
}

export function bindLanguage(
  editor: monaco.editor.IStandaloneCodeEditor,
  lang: WatcherSource<string>,
  immediate: boolean = false
): void {
  let currentLanguage = "";
  const handler = (newValue: string) => {
    if (currentLanguage !== newValue) {
      currentLanguage = newValue;
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newValue);
      }
    }
  };
  watch(lang, handler);
  if (immediate) {
    handler(evaluateWatcherSource(lang));
  }
}
export function bindOptions(
  editor: monaco.editor.IStandaloneDiffEditor,
  options: WatcherSource<monaco.editor.IDiffEditorOptions>,
  immediate?: boolean
): void;

export function bindOptions(
  editor: monaco.editor.IStandaloneCodeEditor,
  options: WatcherSource<monaco.editor.IEditorOptions>,
  immediate?: boolean
): void;

export function bindOptions(editor: any, options: any, immediate?: boolean) {
  watch(options, newValue => {
    editor.updateOptions(newValue);
  });
  if (immediate) {
    editor.updateOptions(evaluateWatcherSource(options));
  }
}
