import * as vca from "vue-tsx-support/lib/vca";
import {
  vtableOf,
  VtableColumn,
  VtableEventsOn,
  VtableSlotCellProps,
  RowClickEventArgs
} from "vue-vtable";
import * as md from "view/utils/md-classes";
import * as emotion from "emotion";
import { required } from "./base/prop";
import { ref } from "@vue/composition-api";
const css = emotion.css;

const Vtable = vtableOf<FileEntry>();

const fileColumns: readonly VtableColumn[] = Object.freeze([
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
]);

// @vue/component
export default vca.component({
  name: "FileTable",
  props: {
    files: required<readonly FileEntry[]>(),
    widths: required<Record<string, number>>(Object)
  },
  setup(p, ctx: vca.SetupContext<VtableEventsOn<FileEntry>>) {
    const selectedFile = ref("");
    const getFileKey = (item: FileEntry) => item.path;
    const getRowClass = (item: FileEntry) =>
      item.path === selectedFile.value ? "vtable-row-selected" : "vtable-row";
    const getCellValue = (arg: VtableSlotCellProps<FileEntry>) =>
      arg.columnId === "path" ? arg.item.path : arg.item.statusCode;
    const onRowclick = (arg: RowClickEventArgs<FileEntry>) => {
      selectedFile.value = arg.item.path;
    };
    return () => (
      <div staticClass={style.container}>
        <Vtable
          items={p.files}
          columns={fileColumns}
          widths={p.widths}
          rowHeight={24}
          getItemKey={getFileKey}
          getRowClass={getRowClass}
          onRowclick={onRowclick}
          scopedSlots={{
            cell: getCellValue
          }}
          {...{ on: ctx.listeners }}
        />
      </div>
    );
  }
});

const style = {
  container: css`
    display: flex;
    flex: 1;

    .vlist-container {
      display: flex;
      margin: 4px 2px;
      background-color: #333;
    }

    .vlist-row {
      font-family: var(--monospace-fontfamily);
      user-select: none;
      cursor: default;
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
      user-select: none;
      cursor: default;
    }
  `
};
