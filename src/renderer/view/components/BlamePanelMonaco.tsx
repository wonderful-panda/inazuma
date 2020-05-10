import ResizeSensor from "vue-resizesensor";
import * as vca from "vue-tsx-support/lib/vca";
import { shortHash } from "../filters";
import Vue from "vue";
import { __sync } from "../utils/modifiers";
import { css } from "emotion";
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount
} from "@vue/composition-api";
import { formatDateL } from "core/utils";
import { required } from "./base/prop";
import {
  useDecoration,
  onHoveredLineNumberChanged,
  bindLanguage,
  bindOptions
} from "./composition/monaco";

const style = {
  wrapper: css`
    position: relative;
    flex: 1;
    border: 1px solid #444;
    overflow: hidden;
  `,
  editor: css`
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    .monaco-editor {
      .margin-view-overlays {
        border-right: 2px solid #666;
      }
      .line-numbers {
        color: #555;
        cursor: pointer !important;
        padding-left: 8px;
        white-space: nowrap;
      }
      .hunk-head,
      .hunk-head-margin {
        border-top: 1px solid #444;
      }
      .hunk-head-margin ~ .line-numbers {
        color: #ddd;
      }

      .selected-lines {
        background-color: rgba(255, 140, 0, 0.6);
        left: 0 !important;
        width: 4px !important;
      }
    }
  `
};

function createLineNumberFormatter(blame: Blame) {
  // const lineNoWidth = blame.commitIds.length.toString().length;
  const dateMap = new Map(blame.commits.map(c => [c.id, formatDateL(c.date)]));
  return (lineno: number) => {
    const id = blame.commitIds[lineno - 1];
    if (!id) {
      return "";
    }
    const linenoStr = lineno.toString();
    return `${linenoStr} ${shortHash(id)} ${dateMap.get(id)}`;
  };
}

interface PrefixedEvents {
  onHoveredCommitIdChanged: { commitId: string };
  onContextMenu: { commitId: string };
}

export const BlamePanelMonaco = vca.component({
  name: "BlamePanelMonaco",
  props: {
    language: required(String),
    blame: required<Blame>(),
    selectedCommitId: required(String)
  },
  setup(props, ctx: vca.SetupContext<PrefixedEvents>) {
    const emitUpdate = vca.updateEmitter<typeof props>();
    let editor: monaco.editor.IStandaloneCodeEditor | null = null;

    const options = computed<monaco.editor.IEditorConstructionOptions>(() => {
      const blame = props.blame;
      return {
        readOnly: true,
        folding: false,
        renderIndentGuides: false,
        minimap: { enabled: false },
        lineNumbersMinChars: blame.commitIds.length.toString().length + 21,
        lineNumbers: createLineNumberFormatter(blame),
        selectOnLineNumbers: false,
        contextmenu: false
      };
    });
    const lineNumberMap = computed(() => {
      const ret: Record<string, number[]> = {};
      props.blame.commitIds.forEach((commitId, index) => {
        (ret[commitId] || (ret[commitId] = [])).push(index + 1);
      });
      return ret;
    });

    const blameDecoration = useDecoration({
      className: "hunk-head",
      marginClassName: "hunk-head-margin",
      isWholeLine: true
    });
    const updateBlameDecoration = () => {
      if (!editor) {
        return;
      }
      const lineNumbers = props.blame.commitIds
        .map((id, index, arr) => (id !== arr[index - 1] ? index + 1 : -1))
        .filter(v => v >= 0);
      lineNumbers.push(props.blame.commitIds.length + 1);
      blameDecoration.update(editor, lineNumbers);
    };

    const selectedCommitDecoration = useDecoration({
      linesDecorationsClassName: "selected-lines",
      isWholeLine: true,
      overviewRuler: {
        color: "rgba(255, 140, 0, 0.6)",
        darkColor: "rgba(255, 140, 0, 0.6)",
        position: monaco.editor.OverviewRulerLane.Right
      }
    });
    const updateSelectedCommitDecoration = () => {
      selectedCommitDecoration.update(
        editor,
        lineNumberMap.value[props.selectedCommitId] || []
      );
    };

    const updateContent = (blame: Blame) => {
      emitUpdate(ctx, "selectedCommitId", "");
      if (editor) {
        editor.setValue(blame.content.text);
        updateBlameDecoration();
        emitUpdate(ctx, "selectedCommitId", blame.commits[0].id);
        editor.setScrollPosition({ scrollLeft: 0, scrollTop: 0 });
      }
    };

    watch(() => props.blame, updateContent);
    watch(
      () => props.selectedCommitId,
      () => updateSelectedCommitDecoration()
    );

    const onMouseDown = (e: monaco.editor.IEditorMouseEvent) => {
      const { position, type } = e.target;
      if (!position) {
        return;
      }
      if (
        type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN &&
        type !== monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS &&
        type !== monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS &&
        type !== monaco.editor.MouseTargetType.GUTTER_VIEW_ZONE
      ) {
        return;
      }
      const commitId = props.blame.commitIds[position.lineNumber - 1] || "";
      emitUpdate(ctx, "selectedCommitId", commitId);
    };
    const onContextMenu = (e: monaco.editor.IEditorMouseEvent) => {
      if (e.target.position) {
        const lineNumber = e.target.position.lineNumber;
        const commitId = props.blame.commitIds[lineNumber - 1];
        if (commitId) {
          vca.emitOn(ctx, "onContextMenu", { commitId });
        }
      }
    };
    const onResized = () => {
      if (editor) {
        editor.layout();
      }
    };

    const placeholder = ref<HTMLDivElement | null>(null);
    onMounted(() => {
      if (!placeholder.value) {
        return;
      }
      editor = monaco.editor.create(placeholder.value, {
        language: props.language,
        ...options.value
      });
      bindLanguage(editor, () => props.language);
      bindOptions(editor, options);
      editor.onMouseDown(onMouseDown);
      editor.onContextMenu(onContextMenu);
      onHoveredLineNumberChanged(editor, lineNumber => {
        const commitId = props.blame.commitIds[lineNumber - 1] || "";
        vca.emitOn(ctx, "onHoveredCommitIdChanged", { commitId });
      });
      Vue.nextTick(() => updateContent(props.blame));
    });
    onBeforeUnmount(() => {
      if (editor) {
        editor.dispose();
        editor = null;
      }
    });

    return () => {
      return (
        <div class={style.wrapper}>
          <ResizeSensor onResized={onResized} debounce={200} />
          <div ref={placeholder as any} class={style.editor} />
        </div>
      );
    };
  }
});

export default BlamePanelMonaco;
