import * as vca from "vue-tsx-support/lib/vca";
import { vtableOf, VtableColumn, Vtable, VtableEventsOn } from "vue-vtable";
import p from "vue-strict-prop";
import { LogItem } from "../mainTypes";
import { style } from "./LogTable";
import { ref, watch } from "@vue/composition-api";
import { formatDateL } from "core/utils";
import { GitHash } from "./GitHash";
import { MonoSpan } from "./base/mono";

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
    items: p.ofRoArray<FileCommit>().required,
    rowHeight: p(Number).required,
    selectedIndex: p(Number).required,
    widths: p.ofObject<Dict<number>>().required
  },
  setup(p, ctx: vca.SetupContext<VtableEventsOn<FileCommit>>) {
    const vtableRef = ref(null as Vtable<LogItem> | null);
    watch(
      () => p.selectedIndex,
      newValue => {
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
          ref={vtableRef as any}
          staticClass={style.container}
          items={p.items}
          columns={columns}
          widths={p.widths}
          rowHeight={rowHeight}
          rowStyleCycle={2}
          getItemKey={item => item.id}
          getRowClass={(_item, index) =>
            index === selectedIndex ? style.selectedRow : ""
          }
          {...{ on: ctx.listeners }}
          scopedSlots={{
            cell: p => renderCell(p.columnId, p.item)
          }}
        />
      );
    };
  }
});
