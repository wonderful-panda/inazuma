import type * as monaco from "monaco-editor";
import { memo, useMemo } from "react";
import { getLangIdFromPath, setup as setupMonaco } from "@/monaco";
import { type DiffContent, MonacoDiffEditor } from "../MonacoDiffEditor";

setupMonaco();

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
  const leftContent = useDiffContent(left);
  const rightContent = useDiffContent(right);
  return (
    <div className="relative grid grid-row-1 grid-col-1 flex-1 overflow-hidden border border-paper p-2">
      <MonacoDiffEditor
        options={options}
        left={leftContent}
        right={rightContent}
        className="absolute top-0 bottom-0 left-0 right-0"
      />
    </div>
  );
};

export const DiffViewer = memo(DiffViewer_);
