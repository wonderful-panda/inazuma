import MonacoEditor from "vue-monaco";
import * as vca from "vue-tsx-support/lib/vca";
import p from "vue-strict-prop";
import { shortHash } from "../filters";
import { lineIndicesToRanges } from "view/monaco";
import Vue from "vue";
import { __sync } from "../utils/modifiers";
import * as emotion from "emotion";
import { ref, computed, watch } from "@vue/composition-api";
import { updateEmitter, formatDateL } from "core/utils";
const css = emotion.css;

type MonacoEditorInstance = InstanceType<typeof MonacoEditor>;

const style = css`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  .line-numbers {
    color: #666;
    cursor: pointer !important;
    padding-left: 8px;
    white-space: nowrap;
  }

  .blame-hunk-head,
  .blame-hunk-head-margin {
    border-top: 1px solid #444;
  }
  .blame-hunk-head-margin ~ .line-numbers,
  .blame-first-line-margin ~ .line-numbers {
    color: #ddd;
  }

  .blame-selected-linesdecorations {
    background-color: rgba(255, 140, 0, 0.6);
    left: 0 !important;
    width: 4px !important;
  }
`;

interface PrefixedEvents {
  onHoveredCommitIdChanged: { commitId: string };
  onContextMenu: { commitId: string };
}

export const BlamePanelMonaco = vca.component({
  props: {
    language: p(String).required,
    blame: p.ofObject<Blame>().required,
    selectedCommitId: p(String).required
  },
  setup(props, ctx: vca.SetupContext<PrefixedEvents>) {
    const emitUpdate = updateEmitter<typeof props>();
    const editor = ref(undefined as
      | monaco.editor.IStandaloneCodeEditor
      | undefined);
    const onEditorDidMount = () => {
      editor.value = (ctx.refs.root as MonacoEditorInstance).getMonaco();
      updateStaticDecorations();
      updateSelectedCommitDecorations();
    };

    const hoveredLineNumber = ref(-1);
    watch(hoveredLineNumber, (newValue, oldValue) => {
      if (newValue !== oldValue) {
        const commitId = props.blame.commitIds[newValue - 1] || "";
        vca.emitOn(ctx, "onHoveredCommitIdChanged", { commitId });
      }
    });

    const options = computed(() => {
      const blame = props.blame;
      const lineNoWidth = blame.commitIds.length.toString().length;
      const zeros = "00000000".slice(0, lineNoWidth + 1);
      const dateMap = new Map(
        blame.commits.map(c => [c.id, formatDateL(c.date)])
      );
      const lineNumbers = (lineno: number) => {
        const linenoStr = (zeros + lineno.toString()).slice(-1 * lineNoWidth);
        const id = blame.commitIds[lineno - 1];
        if (!id) {
          return "";
        }
        return `${linenoStr} ${shortHash(id)} ${dateMap.get(id)}`;
      };
      return {
        theme: "vs-dark",
        readOnly: true,
        automaticLayout: true,
        folding: false,
        minimap: { enabled: false },
        lineDecorationsWidth: (lineNoWidth + 21) * 7,
        lineNumbers,
        selectOnLineNumbers: false,
        contextmenu: false
      } as monaco.editor.IEditorConstructionOptions;
    });

    const staticDecorationIds = ref([] as string[]);
    const updateStaticDecorations = () => {
      if (!editor.value) {
        return;
      }
      const { commitIds } = props.blame;
      const lineIndices = commitIds
        .map((id, index) =>
          0 < index && id !== commitIds[index - 1] ? index : -1
        )
        .filter(v => v >= 0);
      lineIndices.push(commitIds.length);
      const ranges = lineIndicesToRanges(lineIndices);
      const options: monaco.editor.IModelDecorationOptions = {
        className: "blame-hunk-head",
        marginClassName: "blame-hunk-head-margin",
        isWholeLine: true
      };
      const decorations = ranges.map(range => ({ range, options }));
      decorations.push({
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1
        },
        options: {
          marginClassName: "blame-first-line-margin"
        }
      });
      staticDecorationIds.value = editor.value.deltaDecorations(
        staticDecorationIds.value,
        decorations
      );
    };

    const selectedCommitDecorationIds = ref([] as string[]);
    const updateSelectedCommitDecorations = () => {
      if (!editor.value) {
        return;
      }
      const { blame, selectedCommitId } = props;
      const lineIndices = blame.commitIds
        .map((v, index) => (v === selectedCommitId ? index : -1))
        .filter(v => v >= 0);
      const ranges = lineIndicesToRanges(lineIndices);
      const options: monaco.editor.IModelDecorationOptions = {
        linesDecorationsClassName: "blame-selected-linesdecorations",
        isWholeLine: true,
        overviewRuler: {
          color: "rgba(255, 140, 0, 0.6)",
          darkColor: "rgba(255, 140, 0, 0.6)",
          position: monaco.editor.OverviewRulerLane.Right
        }
      };
      selectedCommitDecorationIds.value = editor.value.deltaDecorations(
        selectedCommitDecorationIds.value,
        ranges.map(range => ({ range, options }))
      );
    };

    watch(
      () => props.blame,
      blame => {
        emitUpdate(ctx, "selectedCommitId", "");
        // decorations must be updated after text changed
        Vue.nextTick(() => {
          updateStaticDecorations();
          emitUpdate(ctx, "selectedCommitId", blame.commits[0].id);
        });
      }
    );
    watch(
      () => props.selectedCommitId,
      () => updateSelectedCommitDecorations()
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
    const onMouseMove = (e: monaco.editor.IEditorMouseEvent) => {
      if (e.target.position) {
        hoveredLineNumber.value = e.target.position.lineNumber;
      } else {
        hoveredLineNumber.value = 0;
      }
    };
    const onMouseLeave = () => {
      hoveredLineNumber.value = 0;
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
    return () => {
      return (
        <MonacoEditor
          ref="root"
          class={style}
          language={props.language}
          value={props.blame.content.text}
          options={options.value}
          onEditorDidMount={onEditorDidMount}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          onContextMenu={onContextMenu}
        />
      );
    };
  }
});

export default BlamePanelMonaco;
