<script lang="tsx">
import * as md from "view/common/md-classes";
import { VNode } from "vue";
import * as moment from "moment";
import { componentWithStore } from "../store";
import * as bridge from "view/common/electron-bridge";
import FileTable from "./FileTable.vue";
import * as ds from "view/common/displayState";
import { __sync } from "view/common/modifiers";

// @vue/component
export default componentWithStore({
  name: "RevisionLogCommitDetail",
  mixins: [ds.createMixin("main/RevisionLogCommitDetail")],
  data() {
    return {
      displayState: {
        columnWidths: undefined as number[] | undefined
      }
    };
  },
  computed: {
    commit(): CommitDetail {
      return this.$store.state.selectedCommit;
    },
    classes(): object {
      return {
        [this.$style.container]: true,
        [md.SUBHEADING]: true,
        [this.$style.inactive]: !this.commit.id
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
        return <pre staticClass={this.$style.body}>{this.commit.body}</pre>;
      } else {
        return undefined;
      }
    }
  },
  methods: {
    commitAttr(name: string, value: string | VNode[]): VNode {
      return (
        <tr>
          <td staticClass={this.$style.attrName}>{name}</td>
          <td staticClass={this.$style.attrValue}>{value}</td>
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
      bridge.showContextMenu([
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
        }
      ]);
    }
  },
  render(): VNode {
    const s = this.$style;
    return (
      <div class={this.classes}>
        <div class={[s.summary, md.TITLE]}>{this.commitSummary}</div>
        <table staticClass={s.attrTable}>
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
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex: 1;
  flex-flow: column nowrap;
  padding: 8px;
}

.inactive {
  color: #666;
}

.summary {
  padding: 4px;
  margin-bottom: 8px;
}

.attrTable {
  width: 100%;
  margin-bottom: 8px;
}

.attrName {
  background-color: #333;
  padding: 0 8px;
  vertical-align: middle;
  font-family: var(--monospace-fontfamily);
}

.attrValue {
  @extend .attrName;
  width: 100%;
}

.body {
  margin: 0px 2px 8px 2px;
  font-size: small;
  background-color: #333;
  padding: 0.2em;
  min-height: 1em;
  max-height: 12em;
  white-space: pre-wrap;
  overflow: auto;
}
</style>
