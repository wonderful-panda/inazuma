import * as md from "view/utils/md-classes";
import { VNode } from "vue";
import moment from "moment";
import { withStore } from "../store";
import FileTable from "./FileTable";
import * as ds from "view/store/displayState";
import { __sync } from "view/utils/modifiers";
import * as emotion from "emotion";
import { showFileContextMenu, executeFileCommand } from "../commands";
import { fileCommandDiffWithParent } from "../commands/fileCommandDiff";
const css = emotion.css;

const displayState = ds.createMixin("RevisionLogCommitDetail", {
  columnWidths: {} as Dict<number>
});

export default withStore.mixin(displayState).create(
  // @vue/component
  {
    name: "RevisionLogCommitDetail",
    computed: {
      commit(): CommitDetail {
        return this.state.selectedCommit;
      },
      classes(): object {
        return {
          [style.container]: true,
          [md.SUBHEADING]: true,
          [style.inactive]: !this.commit.id
        };
      },
      commitSummary(): string {
        return this.commit.summary || "No commit selected";
      },
      commitDate(): string {
        if (this.commit.id) {
          return moment(this.commit.date)
            .local()
            .format("llll");
        } else {
          return "";
        }
      },
      shortCommitId(): string {
        return this.commit.id.substring(0, 8);
      },
      shortParentIds(): VNode[] {
        return this.commit.parentIds.map(v => <div>{v.substring(0, 8)}</div>);
      },
      body(): VNode | undefined {
        if (this.commit.body) {
          return <pre staticClass={style.body}>{this.commit.body}</pre>;
        } else {
          return undefined;
        }
      }
    },
    methods: {
      commitAttr(name: string, value: string | VNode[]): VNode {
        return (
          <tr>
            <td staticClass={style.attrName}>{name}</td>
            <td staticClass={style.attrValue}>{value}</td>
          </tr>
        );
      },
      showExternalDiff(item: FileEntry) {
        executeFileCommand(
          fileCommandDiffWithParent,
          this.commit,
          item,
          item.path
        );
      },
      showContextMenu(item: FileEntry, event: Event) {
        event.preventDefault();
        showFileContextMenu(this.commit, item, item.path);
      }
    },
    render(): VNode {
      return (
        <div class={this.classes}>
          <div class={[style.summary, md.TITLE]}>{this.commitSummary}</div>
          <table staticClass={style.attrTable}>
            {this.commitAttr("id", this.shortCommitId)}
            {this.commitAttr("parents", this.shortParentIds)}
            {this.commitAttr("author", this.commit.author)}
            {this.commitAttr("date", this.commitDate)}
          </table>
          {this.body}
          <FileTable
            files={this.commit.files}
            widths={__sync(this.displayState.columnWidths)}
            onRowdblclick={arg => this.showExternalDiff(arg.item)}
            onRowcontextmenu={arg => this.showContextMenu(arg.item, arg.event)}
          />
        </div>
      );
    }
  }
);

const style = {
  container: css`
    display: flex;
    flex: 1;
    flex-flow: column nowrap;
    padding: 8px;
  `,
  inactive: css`
    color: #666;
  `,
  summary: css`
    padding: 4px;
    margin-bottom: 8px;
  `,
  attrTable: css`
    width: 100%;
    margin-bottom: 8px;
  `,
  attrName: css`
    background-color: #333;
    padding: 0 8px;
    vertical-align: middle;
    font-family: var(--monospace-fontfamily);
  `,
  attrValue: css`
    background-color: #333;
    padding: 0 8px;
    vertical-align: middle;
    font-family: var(--monospace-fontfamily);
    width: 100%;
  `,
  body: css`
    margin: 0px 2px 8px 2px;
    font-size: small;
    background-color: #333;
    padding: 0.2em;
    min-height: 1em;
    max-height: 12em;
    white-space: pre-wrap;
    overflow: auto;
  `
};
