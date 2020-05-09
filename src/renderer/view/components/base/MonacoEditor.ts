import Vue from "vue";
import { _TsxComponentV3 } from "vue-tsx-support";
import VueMonacoEditor_ from "vue-monaco";

export type VueMonacoEditorType = _TsxComponentV3<
  Vue & { getEditor(): monaco.editor.IStandaloneCodeEditor; focus(): void },
  {},
  {
    language: string;
    value: string;
    options: monaco.editor.IEditorConstructionOptions;
  },
  {
    onEditorDidMount: monaco.editor.IStandaloneCodeEditor;
  },
  {},
  {}
>;

export type VueMonacoDiffEditorType = _TsxComponentV3<
  Vue & { getEditor(): monaco.editor.IStandaloneDiffEditor },
  {},
  {
    language: string;
    value: string;
    options: monaco.editor.IEditorConstructionOptions;
    diffEditor: true;
    original: string;
  },
  {
    onEditorDidMount: monaco.editor.IStandaloneDiffEditor;
  },
  {},
  {}
>;

export const VueMonacoEditor = VueMonacoEditor_ as VueMonacoEditorType;
export const VueMonacoDiffEditor = VueMonacoEditor_ as VueMonacoDiffEditorType;
