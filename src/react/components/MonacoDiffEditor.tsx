import * as monaco from "monaco-editor";
import { memo, useEffect, useRef, useState } from "react";

type IStandaloneDiffEditor = monaco.editor.IStandaloneDiffEditor;
type IDiffEditorConstructionOptions = monaco.editor.IDiffEditorConstructionOptions;

export interface DiffContent {
  language: string;
  content: string;
}

export interface MonacoDiffEditorProps {
  className?: string;
  left?: DiffContent;
  right?: DiffContent;
  options: IDiffEditorConstructionOptions;
  onEditorMounted?: (editor: IStandaloneDiffEditor) => void;
}

const emptyContent: DiffContent = { content: "", language: "plaintext" };

const MonacoDiffEditor_: React.FC<MonacoDiffEditorProps> = ({
  className,
  left = emptyContent,
  right = emptyContent,
  options,
  onEditorMounted
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<IStandaloneDiffEditor | undefined>(undefined);
  useEffect(() => {
    const editor = monaco.editor.createDiffEditor(editorRef.current!, {});
    setEditor(editor);
    if (onEditorMounted) {
      onEditorMounted(editor);
    }
    return () => {
      editor.dispose();
      setEditor(undefined);
    };
  }, [onEditorMounted]);

  useEffect(() => {
    editor?.updateOptions(options);
  }, [editor, options]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setModel({
      original: monaco.editor.createModel(left.content, left.language),
      modified: monaco.editor.createModel(right.content, right.language)
    });
    editor.getOriginalEditor().setScrollPosition({ scrollLeft: 0, scrollTop: 0 });
    editor.getModifiedEditor().setScrollPosition({ scrollLeft: 0, scrollTop: 0 });
  }, [editor, left, right]);

  return <div ref={editorRef} className={className} />;
};

export const MonacoDiffEditor = memo(MonacoDiffEditor_);
