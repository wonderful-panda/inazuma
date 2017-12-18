<script lang="tsx">
import { VNode } from "vue";
import * as moment from "moment";
import { componentWithStore } from "../store";
import FileTable from "./FileTable.vue";

// @vue/component
export default componentWithStore({
  name: "RevisionLogCommitDetail",
  computed: {
    commit(): CommitDetail {
      return this.$store.state.selectedCommit;
    },
    className(): string | undefined {
      return this.commit.id ? undefined : "commit-detail-inactive";
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
        return <pre staticClass="commit-detail-body">{this.commit.body}</pre>;
      } else {
        return undefined;
      }
    }
  },
  methods: {
    commitAttr(
      name: string,
      value: string | VNode[],
      monospace?: boolean
    ): VNode {
      const valueClass = {
        "attr-value": true,
        "fontfamily--monospace": monospace
      };
      return (
        <tr>
          <td staticClass="attr-name">{name}</td>
          <td class={valueClass}>{value}</td>
        </tr>
      );
    }
  },
  render(): VNode {
    return (
      <div staticClass="commit-detail md-subheading" class={this.className}>
        <div staticClass="commit-detail-summary md-title">
          {this.commitSummary}
        </div>
        <table staticClass="commit-detail-attrs">
          {this.commitAttr("id", this.shortCommitId, true)}
          {this.commitAttr("parents", this.shortParentIds, true)}
          {this.commitAttr("author", this.commit.author)}
          {this.commitAttr("date", this.commitDate)}
        </table>
        {this.body}
        <FileTable files={this.commit.files} />
      </div>
    );
  }
});
</script>

<style lang="scss">
.commit-detail {
  display: flex;
  flex: 1;
  flex-flow: column nowrap;
  padding: 8px;

  .commit-detail-summary {
    padding: 4px;
    margin-bottom: 8px;
  }

  table {
    width: 100%;
    margin-bottom: 8px;
  }

  td {
    background-color: #333;
    padding: 0 8px;
  }

  .attr-name {
    vertical-align: middle;
  }

  .attr-value {
    width: 100%;
  }

  .commit-detail-body {
    margin: 0px 2px 8px 2px;
    font-size: small;
    background-color: #333;
    padding: 0.2em;
    min-height: 1em;
    max-height: 12em;
    white-space: pre-wrap;
    overflow: auto;
  }
}

.commit-detail-inactive {
  color: #666;
}
</style>
