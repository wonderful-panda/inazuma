import * as md from "view/utils/md-classes";
import { VNode } from "vue";
import moment from "moment";
import { componentWithStore } from "../store";
import { showContextMenu } from "core/browser";
import FileTable from "./FileTable";
import * as ds from "view/store/displayState";
import { __sync } from "view/utils/modifiers";
import * as style from "./RevisionLogCommitDetail.scss";

// @vue/component
export default componentWithStore({
  name: "RevisionLogCommitDetail",
  mixins: [ds.createMixin("RevisionLogCommitDetail")],
  data() {
    return {
      displayState: {
        columnWidths: {} as Dict<number>
      }
    };
  },
  computed: {
    commit(): CommitDetail {
      return this.$store.state.selectedCommit;
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
      if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
        return;
      }
      this.$store.actions.showExternalDiff(
        { path: item.oldPath || item.path, sha: this.commit.id + "~1" },
        { path: item.path, sha: this.commit.id }
      );
    },
    showContextMenu(item: FileEntry, event: Event) {
      event.preventDefault();
      if (item.statusCode !== "M" && !item.statusCode.startsWith("R")) {
        return;
      }
      showContextMenu([
        {
          label: "Compare with previous revision",
          click: () => {
            this.showExternalDiff(item);
          }
        },
        {
          label: "Compare with working tree",
          click: () => {
            this.$store.actions.showExternalDiff(
              { path: item.path, sha: this.commit.id },
              { path: item.path, sha: "UNSTAGED" }
            );
          }
        },
        {
          label: "View file",
          click: () => {
            this.$store.actions.showFileTab(this.commit.id, item.path);
          }
        }
      ]);
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
});
