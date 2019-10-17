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
      onEditorDidMount: void;
      onMouseDown: monaco.editor.IEditorMouseEvent;
      onMouseMove: monaco.editor.IEditorMouseEvent;
      onMouseLeave: monaco.editor.IEditorMouseEvent;
      onContextMenu: monaco.editor.IEditorMouseEvent;
    },
    {},
    {}
  >;
  export = VueMonaco;
}
