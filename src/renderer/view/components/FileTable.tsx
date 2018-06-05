import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { vtableOf, VtableColumn, VtableEventsOn } from "vue-vtable";
import * as md from "view/utils/md-classes";
import * as style from "./FileTable.scss";

const Vtable = vtableOf<FileEntry>();

const fileColumns: VtableColumn[] = [
  {
    id: "status",
    title: "",
    className: md.BODY2,
    defaultWidth: 24,
    minWidth: 24
  },
  {
    id: "path",
    className: "flex--expand " + md.BODY2,
    defaultWidth: 200,
    minWidth: 100
  }
];

// @vue/component
export default tsx.componentFactoryOf<VtableEventsOn<FileEntry>>().create({
  name: "FileTable",
  props: {
    files: p.ofRoArray<FileEntry>().required,
    widths: p.ofObject<Dict<number>>().required
  },
  data() {
    return { selectedFile: "" };
  },
  methods: {
    getFileKey(item: FileEntry): string {
      return item.path;
    },
    renderCell(columnId: string, item: FileEntry) {
      if (columnId === "path") {
        return item.path;
      } else {
        return item.statusCode;
      }
    }
  },
  render(): VNode {
    return (
      <div staticClass={style.container}>
        <Vtable
          items={this.files}
          columns={fileColumns}
          widths={this.widths}
          rowHeight={24}
          getItemKey={this.getFileKey}
          getRowClass={arg => {
            return arg.path === this.selectedFile
              ? "vtable-row-selected"
              : "vtable-row";
          }}
          onRowclick={arg => {
            this.selectedFile = arg.item.path;
          }}
          scopedSlots={{
            cell: p => this.renderCell(p.columnId, p.item)
          }}
          {...{ on: this.$listeners }}
        />
      </div>
    );
  }
});
