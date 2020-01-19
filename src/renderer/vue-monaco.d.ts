declare module "vue-monaco" {
  import Vue from "vue";
  import { _TsxComponentV3 } from "vue-tsx-support";
  const VueMonaco: _TsxComponentV3<
    Vue & { getMonaco(): monaco.editor.IStandaloneCodeEditor },
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
  export = VueMonaco;
}
