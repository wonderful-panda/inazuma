<template lang="pug">
div(:class="$style.container")
  monaco-editor(
    :class="$style.editor",
    :require="amdRequire",
    :language="language",
    :value="code",
    :options="options",
  )
</template>

<script lang="ts">
import * as MonacoEditor from "vue-monaco";
import { componentWithStore } from "../store";
import VIconButton from "./base/VIconButton.vue";
import { editor } from "monaco-editor";
import p from "vue-strict-prop";

// @vue/component
export default componentWithStore(
  {
    name: "RepositoryPageTabFile",
    components: {
      MonacoEditor,
      VIconButton
    },
    props: {
      path: p(String).required
    },
    computed: {
      amdRequire(): Function {
        return (global as any).amdRequire;
      },
      language(): string {
        return "typescript";
      },
      code(): string {
        return `// this is dummy content
function px(arg: number): string {
  return arg.toString();
}`;
      },
      options(): editor.IEditorConstructionOptions {
        return {
          theme: "vs-dark",
          readOnly: true,
          automaticLayout: true
        };
      }
    }
  },
  ["path"]
);
</script>

<style module>
.container {
  display: flex;
  flex: 1;
  margin: 1em;
}

.editor {
  flex: 1;
}
</style>
