import type * as monaco from "monaco-editor";
import { memo, useCallback, useMemo, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { getLangIdFromPath, setup as setupMonaco } from "@/monaco";
import { type DiffContent, MonacoDiffEditor } from "../MonacoDiffEditor";

setupMonaco();

type IStandaloneDiffEditor = monaco.editor.IStandaloneDiffEditor;
type IDiffEditorConstructionOptions = monaco.editor.IDiffEditorConstructionOptions;

export interface DiffViewerProps {
  left?: TextFile;
  right?: TextFile;
}

const options: IDiffEditorConstructionOptions = {
  readOnly: true,
  originalEditable: false,
  folding: false,
  minimap: { enabled: false },
  contextmenu: false
};

const useDiffContent = (tf: TextFile | undefined) =>
  useMemo<DiffContent | undefined>(
    () =>
      tf
        ? {
            content: tf.content,
            language: getLangIdFromPath(tf.path)
          }
        : undefined,
    [tf]
  );

const DiffViewer_: React.FC<DiffViewerProps> = ({ left, right }) => {
  const [editor, setEditor] = useState<IStandaloneDiffEditor | undefined>(undefined);
  const onEditorMounted = useCallback((editor: IStandaloneDiffEditor) => {
    setEditor(editor);
  }, []);
  const onResize = useCallback(() => {
    editor?.layout();
  }, [editor]);
  const leftContent = useDiffContent(left);
  const rightContent = useDiffContent(right);
  return (
    <div className="relative flex-1 overflow-hidden border border-paper">
      <AutoSizer className="flex flex-1 overflow-hidden p-2" onResize={onResize}>
        {() => (
          <MonacoDiffEditor
            options={options}
            left={leftContent}
            right={rightContent}
            className="flex-1 absolute top-0 bottom-0 left-0 right-0"
            onEditorMounted={onEditorMounted}
          />
        )}
      </AutoSizer>
    </div>
  );
};

export const DiffViewer = memo(DiffViewer_);
