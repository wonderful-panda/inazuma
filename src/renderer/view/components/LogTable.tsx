import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { vtableOf, VtableColumn, Vtable, VtableEventsOn } from "vue-vtable";
import LogTableCellGraph from "./LogTableCellGraph";
import LogTableCellSummary from "./LogTableCellSummary";
import { LogItem } from "../mainTypes";
import * as emotion from "emotion";
import { GitHash } from "./GitHash";
import { MonoSpan } from "./base/mono";
import { formatDateL } from "core/utils";
import { required } from "./base/prop";
const css = emotion.css;

const VtableT = vtableOf<LogItem>();

// @vue/component
export default tsx.componentFactoryOf<VtableEventsOn<LogItem>>().create({
  name: "LogTable",
  props: {
    items: required<readonly LogItem[]>(Array),
    rowHeight: required(Number),
    selectedIndex: required(Number),
    widths: required<Record<string, number>>(Object)
  },
  computed: {
    columns(): VtableColumn[] {
      return [
        {
          id: "graph",
          defaultWidth: 120,
          minWidth: 40
        },
        {
          id: "id",
          defaultWidth: 80,
          minWidth: 40
        },
        {
          id: "author",
          defaultWidth: 120,
          minWidth: 40
        },
        {
          id: "date",
          defaultWidth: 100,
          minWidth: 40
        },
        {
          id: "comment",
          defaultWidth: 600,
          className: "flex--expand",
          minWidth: 200
        }
      ];
    }
  },
  watch: {
    selectedIndex(newValue: number) {
      (this.$refs.vtable as Vtable<LogItem>).ensureVisible(newValue);
    }
  },
  methods: {
    renderCell(columnId: string, item: LogItem): VNode | string {
      switch (columnId) {
        case "graph":
          return (
            <LogTableCellGraph graph={item.graph} gridWidth={12} height={24} />
          );
        case "id":
          return <GitHash hash={item.commit.id} />;
        case "author":
          return item.commit.author;
        case "date":
          return <MonoSpan>{formatDateL(item.commit.date)}</MonoSpan>;
        case "comment":
          return <LogTableCellSummary commit={item.commit} refs={item.refs} />;
        default:
          return "";
      }
    }
  },
  render(): VNode {
    const { rowHeight, selectedIndex } = this;
    return (
      <VtableT
        ref="vtable"
        staticClass={style.container}
        items={this.items}
        columns={this.columns}
        widths={this.widths}
        rowHeight={rowHeight}
        rowStyleCycle={2}
        getItemKey={item => item.commit.id}
        getRowClass={(_item, index) =>
          index === selectedIndex ? style.selectedRow : ""
        }
        {...{ on: this.$listeners }}
        scopedSlots={{
          cell: p => [this.renderCell(p.columnId, p.item)]
        }}
      />
    );
  }
});

const style = {
  container: css`
    .vlist-row {
      user-select: none;
      cursor: default;
      &:nth-child(2n) {
        background-color: #282828;
      }
      &:hover {
        background-color: #383838;
      }
    }

    .vlist-header-row {
      border-bottom: solid 1px #aaa;
      user-select: none;
      cursor: default;
    }

    .vtable-splitter {
      border-right: solid 1px #555;
    }

    .vtable-dragging-splitter {
      background-color: #888;
    }
  `,
  selectedRow: css`
    background-color: #484848;
  `
};

export { style };
