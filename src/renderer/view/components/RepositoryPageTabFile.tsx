import * as Electron from "electron";
import * as MonacoEditor from "vue-monaco";
import * as moment from "moment";
import { componentWithStore } from "../store";
import VIconButton from "./base/VIconButton";
import p from "vue-strict-prop";
import { shortHash } from "../filters";
import { lineIndicesToRanges, getLangIdFromPath } from "view/monaco";
import { showContextMenu } from "core/browser";
import { asTuple } from "core/utils";
import { VNode } from "vue";
import * as style from "./RepositoryPageTabFile.scss";

const amdRequire = (global as any).amdRequire;

// @vue/component
export default componentWithStore(
  {
    name: "RepositoryPageTabFile",
    components: {
      MonacoEditor,
      VIconButton
    },
    data() {
      return {
        editorMounted: false,
        hoveredLineNumber: -1,
        selectedCommitId: "",
        staticDecorationIds: [] as string[],
        selectedCommitDecorationIds: [] as string[]
      };
    },
    props: {
      path: p(String).required,
      sha: p(String).required,
      blame: p.ofObject<Blame>().required
    },
    watch: {
      blame() {
        this.updateStaticDecorations();
      },
      selectedCommitId() {
        this.updateSelectedCommitDecorations();
      }
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
          lineDecorationsWidth: (this.lineNoWidth + 21) * 7,
          lineNumbers: this.lineNumberFunc,
          selectOnLineNumbers: false,
          contextmenu: false
        };
      },
      commitMap(): Map<string, BlameCommit> {
        return new Map<string, BlameCommit>(
          this.blame.commits.map(c => asTuple(c.id, c))
        );
      },
      monacoEditor(): monaco.editor.IStandaloneCodeEditor | undefined {
        if (!this.editorMounted) {
          return undefined;
        }
        return (this.$refs.monaco as any).getMonaco();
      },
      hoveredCommit(): BlameCommit | undefined {
        const id = this.blame.commitIds[this.hoveredLineNumber - 1];
        if (!id) {
          return undefined;
        }
        return this.commitMap.get(id);
      },
      hoveredCommitDate(): string {
        const c = this.hoveredCommit;
        return c
          ? moment(c.date)
              .local()
              .format("L LT")
          : "";
      },
      lineNoWidth(): number {
        return this.blame.commitIds.length.toString().length;
      },
      lineNumberFunc(): (lineno: number) => string {
        const zeros = "00000000".slice(0, this.lineNoWidth + 1);
        const boundaryId = this.blame.commits
          .filter(c => c.boundary)
          .map(c => c.id)[0];
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
          if (id === boundaryId) {
            return `${linenoStr} ^${id.slice(0, 7)} ${date}`;
          } else {
            return `${linenoStr} ${shortHash(id)} ${date}`;
          }
        };
      },
      bottomBar(): VNode[] {
        const { hoveredCommit } = this;
        if (!hoveredCommit) {
          return [
            <div class={style.bottomBar} />,
            <div class={style.bottomBar} />
          ];
        } else {
          return [
            <div class={style.bottomBar}>
              <span class={style.commitId}>{shortHash(hoveredCommit.id)}</span>
              <span class={style.date}>{this.hoveredCommitDate}</span>
              <span class={style.author}>{hoveredCommit.author}</span>
              <span class={style.summary}>{hoveredCommit.summary}</span>
            </div>,
            <div class={style.bottomBar}>
              <span class={style.filename}>{hoveredCommit.filename}</span>
            </div>
          ];
        }
      }
    },
    methods: {
      onMouseDown({ target }: monaco.editor.IEditorMouseEvent) {
        const { type } = target;
        if (
          type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN &&
          type !== monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS &&
          type !== monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS &&
          type !== monaco.editor.MouseTargetType.GUTTER_VIEW_ZONE
        ) {
          return;
        }
        const lineIndex = target.position.lineNumber - 1;
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
        this.updateStaticDecorations();
        this.updateSelectedCommitDecorations();
      },
      showContextMenu(e: monaco.editor.IEditorMouseEvent) {
        const lineNumber = e.target.position.lineNumber;
        const commitId = this.blame.commitIds[lineNumber - 1];
        if (!commitId) {
          return;
        }
        const commit = this.commitMap.get(commitId);
        if (!commit) {
          return;
        }
        const actions = this.$store.actions;
        const menus: Electron.MenuItemConstructorOptions[] = [];
        menus.push({
          label: "View this revision",
          click: () => actions.showFileTab(commit.id, commit.filename)
        });
        if (commit.previous) {
          menus.push({
            label: "View previous revision",
            click: () =>
              actions.showFileTab(commit.previous!, commit.previousFilename!)
          });
          menus.push({
            label: "Compare with previous revision",
            click: () =>
              actions.showExternalDiff(
                { path: commit.previousFilename!, sha: commit.previous! },
                { path: commit.filename, sha: commit.id }
              )
          });
        }
        menus.push({
          label: "Compare with working tree",
          click: () =>
            actions.showExternalDiff(
              { path: commit.filename, sha: commit.id },
              { path: this.path, sha: "UNSTAGED" }
            )
        });
        showContextMenu(menus);
      },
      updateStaticDecorations() {
        const monacoEditor = this.monacoEditor;
        if (!monacoEditor) {
          return;
        }
        const { commitIds } = this.blame;
        const lineIndices = commitIds
          .map(
            (id, index) =>
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
            hcColor: "rgba(255, 140, 0, 0.6)",
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
          <monaco-editor
            ref="monaco"
            class={style.editor}
            require={amdRequire}
            language={this.language}
            value={this.blame.content.text}
            options={this.options}
            onEditorMount={this.onEditorMount}
            onMouseDown={this.onMouseDown}
            onMouseMove={this.onMouseMove}
            onMouseLeave={this.onMouseLeave}
            onContextMenu={this.showContextMenu}
          />
          {this.bottomBar}
        </div>
      );
    }
  },
  ["path"]
);
