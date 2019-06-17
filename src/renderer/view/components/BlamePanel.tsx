import MonacoEditor from "vue-monaco";
import moment from "moment";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { shortHash } from "../filters";
import { lineIndicesToRanges, getLangIdFromPath } from "view/monaco";
import { asTuple } from "core/utils";
import { VNode } from "vue";
import FileLogTable from "./FileLogTable";
import VSplitterPanel from "./base/VSplitterPanel";
import BlamePanelFooter from "./BlamePanelFooter";
import { __sync } from "../utils/modifiers";
import * as emotion from "emotion";
import { showFileContextMenu } from "../commands";
import { SplitterDirection } from "view/mainTypes";
import { withPersist } from "./base/withPersist";
const css = emotion.css;

// @vue/component
export const BlamePanel = tsx.componentFactory.create({
  name: "BlamePanel",
  components: {
    MonacoEditor
  },
  props: {
    path: p(String).required,
    sha: p(String).required,
    blame: p.ofObject<Blame>().required
  },
  data() {
    return {
      columnWidths: {} as Record<string, number>,
      splitter: { ratio: 0.3, direction: "vertical" as SplitterDirection },
      editorMounted: false,
      hoveredLineNumber: -1,
      selectedCommitId: "",
      staticDecorationIds: [] as string[],
      selectedCommitDecorationIds: [] as string[]
    };
  },
  computed: {
    language(): string {
      return getLangIdFromPath(this.path);
    },
    options(): monaco.editor.IEditorConstructionOptions {
      return {
        theme: "vs-dark",
        readOnly: true,
        automaticLayout: true,
        folding: false,
        minimap: { enabled: false },
        lineDecorationsWidth: (this.lineNoWidth + 21) * 7,
        lineNumbers: this.lineNumberFunc,
        selectOnLineNumbers: false,
        contextmenu: false
      };
    },
    commitMap(): Map<string, FileCommit> {
      return new Map<string, FileCommit>(
        this.blame.commits.map(c => asTuple(c.id, c))
      );
    },
    monacoEditor(): monaco.editor.IStandaloneCodeEditor | undefined {
      if (!this.editorMounted) {
        return undefined;
      }
      return (this.$refs.monaco as any).getMonaco();
    },
    hoveredCommit(): FileCommit | undefined {
      const id = this.blame.commitIds[this.hoveredLineNumber - 1];
      if (!id) {
        return undefined;
      }
      return this.commitMap.get(id);
    },
    lineNoWidth(): number {
      return this.blame.commitIds.length.toString().length;
    },
    lineNumberFunc(): (lineno: number) => string {
      const zeros = "00000000".slice(0, this.lineNoWidth + 1);
      const formatDate = (v: number) =>
        moment(v)
          .local()
          .format("L");
      const dateMap = new Map<string, string>(
        this.blame.commits.map(c => asTuple(c.id, formatDate(c.date)))
      );
      return lineno => {
        const linenoStr = (zeros + lineno.toString()).slice(
          -1 * this.lineNoWidth
        );
        const id = this.blame.commitIds[lineno - 1];
        if (!id) {
          return "";
        }
        const date = dateMap.get(id);
        return `${linenoStr} ${shortHash(id)} ${date}`;
      };
    },
    selectedCommitIndex(): number {
      const id = this.selectedCommitId;
      if (!id) {
        return -1;
      } else {
        return this.blame.commits.findIndex(c => c.id === id);
      }
    }
  },
  watch: {
    blame() {
      if (this.monacoEditor) {
        this.monacoEditor.setScrollPosition({ scrollLeft: 0, scrollTop: 0 });
        this.selectedCommitId = "";
        // decorations must be updated after text changed
        this.$nextTick(() => {
          this.selectedCommitId = this.blame.commits[0].id;
          this.updateStaticDecorations();
        });
      }
    },
    selectedCommitId() {
      this.updateSelectedCommitDecorations();
    }
  },
  methods: {
    onMouseDown({ target }: monaco.editor.IEditorMouseEvent) {
      const { position, type } = target;
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
      const lineIndex = position.lineNumber - 1;
      this.selectedCommitId = this.blame.commitIds[lineIndex];
    },
    onMouseMove(e: monaco.editor.IEditorMouseEvent) {
      if (e.target.position) {
        this.hoveredLineNumber = e.target.position.lineNumber;
      } else {
        this.hoveredLineNumber = -1;
      }
    },
    onMouseLeave() {
      this.hoveredLineNumber = -1;
    },
    onEditorMount() {
      this.editorMounted = true;
      this.selectedCommitId = this.blame.commits[0].id;
      this.updateStaticDecorations();
      this.updateSelectedCommitDecorations();
    },
    showContextMenu(item: FileCommit) {
      showFileContextMenu(item, item, this.path, true);
    },
    showContextMenuFromEditor(e: monaco.editor.IEditorMouseEvent) {
      if (!e.target.position) {
        return;
      }
      const lineNumber = e.target.position.lineNumber;
      const commitId = this.blame.commitIds[lineNumber - 1];
      if (!commitId) {
        return;
      }
      const commit = this.commitMap.get(commitId);
      if (!commit) {
        return;
      }
      this.showContextMenu(commit);
    },
    updateStaticDecorations() {
      const monacoEditor = this.monacoEditor;
      if (!monacoEditor) {
        return;
      }
      const { commitIds } = this.blame;
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
      const decorationIds = monacoEditor.deltaDecorations(
        this.staticDecorationIds,
        decorations
      );
      this.staticDecorationIds = decorationIds;
    },
    updateSelectedCommitDecorations() {
      const monacoEditor = this.monacoEditor;
      if (!monacoEditor) {
        return;
      }
      const { commitIds } = this.blame;
      const { selectedCommitId } = this;
      const lineIndices = commitIds
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
      const decorationIds = monacoEditor.deltaDecorations(
        this.selectedCommitDecorationIds,
        ranges.map(range => ({ range, options }))
      );
      this.selectedCommitDecorationIds = decorationIds;
    }
  },
  render(): VNode {
    return (
      <div class={style.container}>
        <div class={style.title}>
          <span class={style.path}>{this.path}</span>
          <span class={style.sha}>@ {shortHash(this.sha)}</span>
        </div>
        <VSplitterPanel
          class={style.container}
          splitterWidth={5}
          minSizeFirst="10%"
          minSizeSecond="10%"
          allowDirectionChange
          direction={__sync(this.splitter.direction)}
          ratio={__sync(this.splitter.ratio)}
        >
          <FileLogTable
            slot="first"
            style={{ flex: 1, border: "1px solid #444" }}
            items={this.blame.commits}
            rowHeight={24}
            selectedIndex={this.selectedCommitIndex}
            widths={__sync(this.columnWidths)}
            onRowclick={args => {
              this.selectedCommitId = args.item.id;
            }}
            onRowcontextmenu={args => this.showContextMenu(args.item)}
          />
          <div slot="second" class={style.editorWrapper}>
            <monaco-editor
              ref="monaco"
              class={style.editor}
              language={this.language}
              value={this.blame.content.text}
              options={this.options}
              onEditorDidMount={this.onEditorMount}
              onMouseDown={this.onMouseDown}
              onMouseMove={this.onMouseMove}
              onMouseLeave={this.onMouseLeave}
              onContextMenu={this.showContextMenuFromEditor}
            />
          </div>
        </VSplitterPanel>
        <BlamePanelFooter commit={this.hoveredCommit} />
      </div>
    );
  }
});

const style = {
  container: css`
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    overflow: hidden;
  `,
  title: css`
    font-family: var(--monospace-fontfamily);
    padding-bottom: 4px;
    height: 24px;
    line-height: 24px;
    flex: 0;
  `,
  path: css`
    padding-right: 8px;
  `,
  sha: css`
    color: #888;
  `,
  editorWrapper: css`
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
  `
};

export function blamePanelWithPersist(name: string) {
  return withPersist(BlamePanel, ["columnWidths", "splitter"], name);
}
