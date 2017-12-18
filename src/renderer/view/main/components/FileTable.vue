<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { vtableOf, VtableColumn } from "vue-vtable";

const Vtable = vtableOf<FileEntry>();

const fileColumns: VtableColumn[] = [
  {
    title: "",
    className: "cell-stat md-body-2",
    defaultWidth: 24,
    minWidth: 24
  },
  {
    title: "path",
    className: "cell-path md-body-2",
    defaultWidth: 200,
    minWidth: 100
  }
];

// @vue/component
export default tsx.component({
  name: "FileTable",
  props: {
    files: p.ofRoArray<FileEntry>().required
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
      <div staticClass="commit-detail-files">
        <Vtable
          items={this.files}
          columns={fileColumns}
          rowHeight={24}
          getItemKey={this.getFileKey}
          scopedSlots={{
            cell: p => this.renderCell(p.columnId, p.item)
          }}
        />
      </div>
    );
  }
});
</script>

<style lang="scss">
.commit-detail-files {
  display: flex;
  flex: 1;

  div.vlist-container {
    display: flex;
    margin: 4px 2px;
    background-color: #333;

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

    .cell-path {
      flex: 1;
    }
  }
}
</style>
