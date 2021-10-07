import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";

export interface MonacoEditorProps {
  className?: string;
  language: string;
  options: monaco.editor.IEditorConstructionOptions;
  value: string;
  onEditorMounted?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

const MonacoEditor: React.VFC<MonacoEditorProps> = ({
  className,
  language,
  options,
  value,
  onEditorMounted
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  useEffect(() => {
    const editor = monaco.editor.create(editorRef.current!, {});
    setEditor(editor);
    if (onEditorMounted) {
      onEditorMounted(editor);
    }
    return () => {
      editor.dispose();
      setEditor(null);
    };
  }, []);

  useEffect(() => {
    editor?.updateOptions(options);
  }, [!!editor, options]);

  useEffect(() => {
    const model = editor?.getModel();
    if (model) {
      monaco.editor.setModelLanguage(model, language);
    }
  }, [!!editor, language]);

  useEffect(() => {
    editor?.setValue(value);
    editor?.setScrollPosition({ scrollLeft: 0, scrollTop: 0 });
  }, [!!editor, value]);

  return <div ref={editorRef} className={className} />;
};

export default MonacoEditor;
