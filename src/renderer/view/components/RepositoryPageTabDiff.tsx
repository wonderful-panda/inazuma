import * as vca from "vue-tsx-support/lib/vca";
import { useRootModule } from "../store";
import VBackdropSpinner from "./base/VBackdropSpinner";
import {
  onMounted,
  computed,
  ref,
  watch,
  onBeforeUnmount
} from "@vue/composition-api";
import { provideStorageWithAdditionalNamespace } from "./injection/storage";
import { required, optional } from "./base/prop";
import * as emotion from "@emotion/css";
import { getLangIdFromPath } from "view/monaco";
import { bindLanguage, bindOptions } from "./composition/monaco";
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

function isEditable(revspec: string): boolean {
  return revspec === "STAGED" || revspec === "UNSTAGED";
}

export function makeRangeFromLineChange(
  change: monaco.editor.ILineChange,
  target: "original" | "modified"
): monaco.Range {
  const start =
    target === "modified"
      ? change.modifiedStartLineNumber
      : change.originalStartLineNumber;
  const end =
    target === "modified"
      ? change.modifiedEndLineNumber
      : change.originalEndLineNumber;

  if (end === 0) {
    // no lines contained
    return new monaco.Range(start + 1, 0, start + 1, 0);
  } else {
    return new monaco.Range(start, 0, end + 1, 0);
  }
}

export function getChangeAtLine(
  changes: readonly monaco.editor.ILineChange[] | null,
  lineNumber: number,
  target: "original" | "modified"
): monaco.editor.ILineChange | null {
  if (!changes) {
    return null;
  }
  for (const c of changes) {
    const start =
      target === "modified"
        ? c.modifiedStartLineNumber
        : c.originalStartLineNumber;
    const end =
      target === "modified" ? c.modifiedEndLineNumber : c.originalEndLineNumber;
    if (end === 0) {
      if (lineNumber === start + 1) {
        return c;
      } else if (lineNumber < start + 1) {
        break;
      }
    } else {
      if (start <= lineNumber) {
        if (lineNumber <= end) {
          return c;
        }
      } else {
        break;
      }
    }
  }
  return null;
}

const DiffEditor = vca.component({
  name: "DiffEditor",
  props: {
    left: required<TextFile>(Object),
    right: required<TextFile>(Object)
  },
  setup(p) {
    const el = ref<HTMLDivElement | null>(null);
    let editors = null as {
      diff: monaco.editor.IStandaloneDiffEditor;
      original: monaco.editor.IStandaloneCodeEditor;
      modified: monaco.editor.IStandaloneCodeEditor;
    } | null;

    const options = computed<monaco.editor.IDiffEditorOptions>(() => ({
      folding: false,
      minimap: { enabled: false },
      selectOnLineNumbers: false,
      contextmenu: false,
      readOnly: !isEditable(p.right.revspec),
      originalEditable: isEditable(p.left.revspec),
      automaticLayout: true,
      ignoreTrimWhitespace: false
    }));
    const language = computed(() => getLangIdFromPath(p.right.path));

    const copyDifference = (
      current: "original" | "modified",
      from: "original" | "modified"
    ) => {
      if (!editors) {
        return;
      }
      const lineNumber = editors[current].getPosition()?.lineNumber || 0;
      const changes = editors.diff.getLineChanges() || [];
      const change = getChangeAtLine(changes, lineNumber, current);
      console.log(changes, lineNumber, change);
      if (!change) {
        return;
      }
      const to = from === "original" ? "modified" : "original";
      const range = makeRangeFromLineChange(change, from);
      const text = editors[from].getModel()?.getValueInRange(range) || "";
      console.log(text);
      editors[to].executeEdits("", [
        { range: makeRangeFromLineChange(change, to), text }
      ]);
      editors[to].pushUndoStop();
    };

    const addActions = () => {
      if (!editors) {
        return;
      }
      if (isEditable(p.right.revspec)) {
        editors.modified.addAction({
          id: "diff-obtain-from-original",
          label: "Obtain difference",
          keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.RightArrow],
          run: () => copyDifference("modified", "original")
        });
        editors.original.addAction({
          id: "diff-push-to-modified",
          label: "Push difference",
          keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.RightArrow],
          run: () => copyDifference("original", "original")
        });
      }
      if (isEditable(p.left.revspec)) {
        editors.modified.addAction({
          id: "diff-push-to-original",
          label: "Push difference",
          keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow],
          run: () => copyDifference("modified", "modified")
        });
        editors.original.addAction({
          id: "diff-obtain-from-modified",
          label: "Obtain difference",
          keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.LeftArrow],
          run: () => copyDifference("original", "modified")
        });
      }
    };

    onMounted(() => {
      if (!el.value) {
        return;
      }
      const diff = monaco.editor.createDiffEditor(el.value, options.value);
      diff.setModel({
        original: monaco.editor.createModel(p.left.content, language.value),
        modified: monaco.editor.createModel(p.right.content, language.value)
      });
      const original = diff.getOriginalEditor();
      const modified = diff.getModifiedEditor();
      bindOptions(diff, options);
      bindLanguage(modified, language);
      editors = { diff, original, modified };
      addActions();
    });

    onBeforeUnmount(() => {
      if (editors) {
        editors.diff.dispose();
        editors = null;
      }
    });

    watch(
      () => p.left.content,
      newValue => {
        if (editors) {
          editors.original.setValue(newValue);
        }
      }
    );
    watch(
      () => p.right.content,
      newValue => {
        if (editors) {
          editors.modified.setValue(newValue);
        }
      }
    );

    return () => <div ref={el as any} />;
  }
});

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
    return () => {
      if (!p.content) {
        return <VBackdropSpinner />;
      } else {
        return (
          <div class={style.root}>
            <DiffEditor
              class={style.editor}
              left={p.content.left}
              right={p.content.right}
            />
          </div>
        );
      }
    };
  }
});
