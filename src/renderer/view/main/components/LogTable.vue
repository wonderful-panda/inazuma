<script lang="tsx">
import { VNode } from "vue";
import * as moment from "moment";
import { componentWithStore } from "../store";
import { vtableOf } from "vue-vtable";
import LogTableCellGraph from "./LogTableCellGraph.vue";
import LogTableCellSummary from "./LogTableCellSummary.vue";
import { LogItem } from "../mainTypes";
import { dragdrop } from "../dragdrop";

const Vtable = vtableOf<LogItem>();

// @vue/component
export default componentWithStore({
  name: "LogTable",
  computed: {
    items(): LogItem[] {
      const state = this.$store.state;
      return state.commits.map(commit => {
        const graph = state.graphs[commit.id];
        const refs = (state.refs[commit.id] || []).filter(
          r => r.type !== "MERGE_HEAD"
        );
        return { commit, graph, refs };
      });
    }
  },
  methods: {
    onRowdragover(item: LogItem, event: DragEvent) {
      if (item.commit.id === "--") {
        return;
      }
      if (dragdrop.isDataPresent(event, "git/branch")) {
        event.dataTransfer.dropEffect = "move";
        event.preventDefault();
      }
    },
    onRowdrop(item: LogItem, event: DragEvent) {
      if (item.commit.id === "--") {
        return;
      }
      const data = dragdrop.getData(event, "git/branch");
      console.log(data);
    },
    renderCell(columnId: string, item: LogItem): VNode | string {
      switch (columnId) {
        case "graph":
          return (
            <LogTableCellGraph graph={item.graph} gridWidth={12} height={24} />
          );
        case "id":
          return item.commit.id.substring(0, 8);
        case "author":
          return item.commit.author;
        case "date":
          return moment(item.commit.date)
            .local()
            .format("L");
        case "comment":
          return <LogTableCellSummary commit={item.commit} refs={item.refs} />;
        default:
          return "";
      }
    }
  },
  render(): VNode {
    const { columns, rowHeight, selectedIndex } = this.$store.state;
    return (
      <Vtable
        staticClass="revision-log"
        items={this.items}
        columns={columns}
        rowHeight={rowHeight}
        rowStyleCycle={2}
        getItemKey={item => item.commit.id}
        getRowClass={(_item, index) =>
          index === selectedIndex ? "vtable-row-selected" : "vtable-row"
        }
        onRowclick={arg => this.$store.actions.setSelectedIndex(arg.index)}
        onRowdragover={arg => this.onRowdragover(arg.item, arg.event)}
        onRowdrop={arg => this.onRowdrop(arg.item, arg.event)}
        scopedSlots={{
          cell: p => [this.renderCell(p.columnId, p.item)]
        }}
      />
    );
  }
});
</script>

<style lang="scss">
.revision-log {
  .vlist-row:nth-child(2n) {
    background-color: #282828;
  }

  .vlist-row:hover {
    background-color: #383838;
  }

  .vtable-row-selected {
    background-color: #484848;
  }

  .vlist-header-row {
    border-bottom: solid 1px #aaa;
  }

  .vtable-row,
  .vtable-row-selected {
    .cell-id,
    .cell-date {
      font-family: monospace;
      font-size: small;
    }
    .cell-graph {
      padding-left: 12px;
    }
  }

  .cell-comment {
    flex: 1;
  }

  .vtable-splitter {
    border-left: solid 1px #555;
  }

  .vtable-dragging-splitter {
    background-color: #888;
  }
}
</style>
