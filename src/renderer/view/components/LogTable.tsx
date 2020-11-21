import * as vca from "vue-tsx-support/lib/vca";
import { vtableOf, VtableColumn, Vtable, VtableEventsOn, VtableSlotCellProps } from "vue-vtable";
import LogTableCellGraph from "./LogTableCellGraph";
import LogTableCellSummary from "./LogTableCellSummary";
import { LogItem } from "../mainTypes";
import { css } from "@emotion/css";
import { GitHash } from "./GitHash";
import { MonoSpan } from "./base/mono";
import { formatDateL } from "core/date";
import { required } from "./base/prop";
import { watch, ref } from "@vue/composition-api";

const VtableT = vtableOf<LogItem>();

const columns: readonly VtableColumn[] = Object.freeze([
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
]);

export default vca.component({
  name: "LogTable",
  props: {
    items: required<readonly LogItem[]>(Array),
    rowHeight: required(Number),
    selectedIndex: required(Number),
    widths: required<Record<string, number>>(Object)
  },
  setup(p, ctx: vca.SetupContext<VtableEventsOn<LogItem>>) {
    const vtableRef = ref<Vtable<LogItem> | null>(null);
    watch(
      () => p.selectedIndex,
      (newValue) => {
        if (vtableRef.value) {
          vtableRef.value.ensureVisible(newValue);
        }
      }
    );

    const renderCell = (payload: VtableSlotCellProps<LogItem>) => {
      const { columnId, item } = payload;
      switch (columnId) {
        case "graph":
          return <LogTableCellGraph graph={item.graph} gridWidth={12} height={24} />;
        case "id":
          return <GitHash hash={item.commit.id} />;
        case "author":
          return item.commit.author;
        case "date":
          return <MonoSpan>{formatDateL(item.commit.date)}</MonoSpan>;
        case "comment":
          return <LogTableCellSummary commit={item.commit} refs={item.refs} />;
        default:
          return undefined;
      }
    };
    const getItemKey = (item: LogItem) => item.commit.id;
    const getRowClass = (_item: LogItem, index: number) =>
      index === p.selectedIndex ? style.selectedRow : "";

    return () => (
      <VtableT
        ref={vtableRef}
        staticClass={style.container}
        items={p.items}
        columns={columns}
        widths={p.widths}
        rowHeight={p.rowHeight}
        rowStyleCycle={2}
        getItemKey={getItemKey}
        getRowClass={getRowClass}
        {...{ on: ctx.listeners }}
        scopedSlots={{ cell: renderCell }}
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
