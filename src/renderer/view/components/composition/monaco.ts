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

export function bindLanguage(
  editor: monaco.editor.IStandaloneCodeEditor,
  lang: Ref<string> | (() => string)
): void {
  let currentLanguage = "";
  watch(lang, newValue => {
    if (currentLanguage !== newValue) {
      currentLanguage = newValue;
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newValue);
      }
    }
  });
}
