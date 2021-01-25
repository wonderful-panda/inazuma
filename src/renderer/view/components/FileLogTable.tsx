import * as vca from "vue-tsx-support/lib/vca";
import { vtableOf, VtableColumn, Vtable, VtableEventsOn } from "vue-vtable";
import { LogItem } from "../mainTypes";
import { style } from "./LogTable";
import { ref, watch } from "@vue/composition-api";
import { formatDateL } from "core/date";
import { GitHash } from "./GitHash";
import { MonoSpan } from "./base/mono";
import { required } from "./base/prop";
import { normalizeListeners } from "core/utils";

const VtableT = vtableOf<FileCommit>();
const columns: VtableColumn[] = [
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

export default vca.component({
  name: "FileLogTable",
  props: {
    items: required<readonly FileCommit[]>(Array),
    rowHeight: required(Number),
    selectedIndex: required(Number),
    widths: required<Record<string, number>>()
  },
  setup(p, ctx: vca.SetupContext<VtableEventsOn<FileCommit>>) {
    const vtableRef = ref<Vtable<LogItem> | null>(null);
    watch(
      () => p.selectedIndex,
      (newValue) => {
        if (vtableRef.value) {
          vtableRef.value.ensureVisible(newValue);
        }
      }
    );
    const renderCell = (columnId: string, item: FileCommit) => {
      switch (columnId) {
        case "id":
          return <GitHash hash={item.id} />;
        case "author":
          return item.author;
        case "date":
          return <MonoSpan>{formatDateL(item.date)}</MonoSpan>;
        case "comment":
          return item.summary;
        case "path":
          return item.path;
        default:
          return "";
      }
    };

    return () => {
      const { rowHeight, selectedIndex } = p;
      return (
        <VtableT
          ref={vtableRef}
          staticClass={style.container}
          items={p.items}
          columns={columns}
          widths={p.widths}
          rowHeight={rowHeight}
          rowStyleCycle={2}
          getItemKey={(item) => item.id}
          getRowClass={(_item, index) => (index === selectedIndex ? style.selectedRow : "")}
          on={normalizeListeners(ctx)}
          scopedSlots={{
            cell: (p) => renderCell(p.columnId, p.item)
          }}
        />
      );
    };
  }
});
