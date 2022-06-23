import * as monaco from "monaco-editor";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";

type IStandaloneCodeEditor = monaco.editor.IStandaloneCodeEditor;

export interface MonacoEditorProps {
  className?: string;
  language: string;
  options: monaco.editor.IEditorConstructionOptions;
  value: string;
  onEditorMounted?: (editor: IStandaloneCodeEditor) => void;
}

const MonacoEditor_: React.FC<MonacoEditorProps> = ({
  className,
  language,
  options,
  value,
  onEditorMounted
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<IStandaloneCodeEditor | null>(null);
  useEffect(() => {
    const editor = monaco.editor.create(editorRef.current!, {});
    // const wrapper = createEditorWrapper(editor);
    setEditor(editor);
    if (onEditorMounted) {
      onEditorMounted(editor);
    }
    return () => {
      editor.dispose();
      setEditor(null);
    };
  }, [onEditorMounted]);

  useEffect(() => {
    editor?.updateOptions(options);
  }, [editor, options]);

  useEffect(() => {
    const model = editor?.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, language);
    }
  }, [editor, language]);

  useLayoutEffect(() => {
    editor?.setValue(value);
    editor?.setScrollPosition({ scrollLeft: 0, scrollTop: 0 });
  }, [editor, value]);

  return <div ref={editorRef} className={className} />;
};

export const MonacoEditor = memo(MonacoEditor_);
