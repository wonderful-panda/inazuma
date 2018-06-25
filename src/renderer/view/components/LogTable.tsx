import { VNode } from "vue";
import moment from "moment";
import * as tsx from "vue-tsx-support";
import { vtableOf, VtableColumn, Vtable, VtableEventsOn } from "vue-vtable";
import p from "vue-strict-prop";
import LogTableCellGraph from "./LogTableCellGraph";
import LogTableCellSummary from "./LogTableCellSummary";
import { LogItem } from "../mainTypes";
import * as style from "./LogTable.scss";

const VtableT = vtableOf<LogItem>();

export default tsx.componentFactoryOf<VtableEventsOn<LogItem>>().create(
  // @vue/component
  {
    name: "LogTable",
    props: {
      items: p.ofRoArray<LogItem>().required,
      rowHeight: p(Number).required,
      selectedIndex: p(Number).required,
      widths: p.ofObject<Dict<number>>().required
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
        (this.$refs["vtable"] as Vtable<LogItem>).ensureVisible(newValue);
      }
    },
    methods: {
      renderCell(columnId: string, item: LogItem): VNode | string {
        switch (columnId) {
          case "graph":
            return (
              <LogTableCellGraph
                graph={item.graph}
                gridWidth={12}
                height={24}
              />
            );
          case "id":
            return (
              <span class="fontfamily--monospace" title={item.commit.id}>
                {item.commit.id.substring(0, 8)}
              </span>
            );
          case "author":
            return item.commit.author;
          case "date":
            return (
              <span class="fontfamily--monospace">
                {moment(item.commit.date)
                  .local()
                  .format("L")}
              </span>
            );
          case "comment":
            return (
              <LogTableCellSummary commit={item.commit} refs={item.refs} />
            );
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
  },
  ["items", "rowHeight", "selectedIndex"]
);
