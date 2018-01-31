<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { vtableOf, VtableColumn, VtableEventsOn } from "vue-vtable";
import * as md from "view/common/md-classes";

const Vtable = vtableOf<FileEntry>();

const fileColumns: VtableColumn[] = [
  {
    title: "",
    className: md.BODY2,
    defaultWidth: 24,
    minWidth: 24
  },
  {
    title: "path",
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
    widths: p.ofRoArray<number>().optional
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
      <div staticClass={this.$style.container}>
        <Vtable
          items={this.files}
          columns={fileColumns}
          initialWidths={this.widths}
          rowHeight={24}
          getItemKey={this.getFileKey}
          onColumnresize={args => this.$emit("update:widths", args.widths)}
          getRowClass={arg => {
            return arg.path === this.selectedFile ? "vtable-row-selected" : "vtable-row";
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
</script>

<style lang="scss" module>
.container {
  display: flex;
  flex: 1;

  :global {
    .vlist-container {
      display: flex;
      margin: 4px 2px;
      background-color: #333;
    }

    .vlist-row {
      font-family: monospace;
      &:hover {
        background-color: #4c4c4c;
      }
    }

    .vtable-row-selected {
      background-color: #484848;
    }

    .vtable-splitter {
      border-left: solid 1px #222;
    }

    .vtable-dragging-splitter {
      background-color: #222;
    }

    .vlist-header-row {
      border-bottom: solid 2px #222;
    }
  }
}
</style>
