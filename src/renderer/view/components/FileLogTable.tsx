import { VNode } from "vue";
import moment from "moment";
import * as tsx from "vue-tsx-support";
import { vtableOf, VtableColumn, Vtable, VtableEventsOn } from "vue-vtable";
import p from "vue-strict-prop";
import { LogItem } from "../mainTypes";
import { shortHash } from "../filters";
import { style } from "./LogTable";

const VtableT = vtableOf<FileCommit>();

// @vue/component
export default tsx.componentFactoryOf<VtableEventsOn<FileCommit>>().create({
  name: "FileLogTable",
  props: {
    items: p.ofRoArray<FileCommit>().required,
    rowHeight: p(Number).required,
    selectedIndex: p(Number).required,
    widths: p.ofObject<Dict<number>>().required
  },
  computed: {
    columns(): VtableColumn[] {
      return [
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
          minWidth: 200
        },
        {
          id: "path",
          className: "fontfamily--monospace flex--expand",
          defaultWidth: 400,
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
    renderCell(columnId: string, item: FileCommit): VNode | string {
      switch (columnId) {
        case "id":
          return (
            <span class="fontfamily--monospace" title={item.id}>
              {shortHash(item.id.substring(0, 8))}
            </span>
          );
        case "author":
          return item.author;
        case "date":
          return (
            <span class="fontfamily--monospace">
              {moment(item.date)
                .local()
                .format("L")}
            </span>
          );
        case "comment":
          return item.summary;
        case "path":
          return item.filename;
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
        getItemKey={item => item.id}
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
