import * as vca from "vue-tsx-support/lib/vca";
import MonacoEditor from "vue-monaco";
import { useRootModule } from "../store";
import VBackdropSpinner from "./base/VBackdropSpinner";
import { onMounted, computed } from "@vue/composition-api";
import { provideStorageWithAdditionalNamespace } from "./injection/storage";
import { required, optional } from "./base/prop";
import * as emotion from "emotion";
import { getLangIdFromPath } from "view/monaco";
const css = emotion.css;

const style = {
  root: css`
    display: flex;
    flex: 1;
    position: relative;
    overflow: hidden;
    border: 1px;
  `,
  editor: css`
    flex: 1;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 20px;
    right: 0;
  `
};

export default vca.component({
  name: "RepositoryPageTabDiff",
  props: {
    tabkey: required(String),
    left: required<FileSpec>(Object),
    right: required<FileSpec>(Object),
    content: optional<{ left: TextFile; right: TextFile }>(Object)
  },
  setup(p) {
    const rootCtx = useRootModule();
    provideStorageWithAdditionalNamespace("TabDiff");

    onMounted(() => {
      rootCtx.actions.loadDiffTabLazyProps({ key: p.tabkey });
    });
    const options: monaco.editor.IDiffEditorConstructionOptions = {
      theme: "vs-dark",
      automaticLayout: true,
      folding: false,
      minimap: { enabled: false },
      selectOnLineNumbers: false,
      contextmenu: false,
      readOnly: true
    };
    const language = computed(() => getLangIdFromPath(p.right.path));
    return () => {
      if (!p.content) {
        return <VBackdropSpinner />;
      } else {
        return (
          <div class={style.root}>
            <MonacoEditor
              class={style.editor}
              diffEditor
              language={language.value}
              options={options}
              value={p.content.right.content}
              original={p.content.left.content}
            />
          </div>
        );
      }
    };
  }
});
