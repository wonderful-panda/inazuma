import {
  vtreetableOf,
  ExpandableCell,
  VtableColumn,
  TreeNodeWithState as TreeNodeWithState_,
  VtableSlotCellProps as VtableSlotCellProps_,
  RowEventArgs as RowEventArgs_,
  Vtreetable
} from "vue-vtable";
import { componentWithStore } from "../store";
import p from "vue-strict-prop";
import { VNode } from "vue";
import * as ds from "view/store/displayState";
import * as style from "./RepositoryPageTabTree.scss";
import { getFileName, getExtension } from "core/utils";
import { __sync } from "view/utils/modifiers";
import VSplitterPanel from "./base/VSplitterPanel";

type Data = LsTreeEntry["data"];
type TreeNodeWithState = TreeNodeWithState_<Data>;
type VtableSlotCellProps = VtableSlotCellProps_<TreeNodeWithState>;
type RowEventArgs = RowEventArgs_<TreeNodeWithState, MouseEvent>;
const VtreeTableT = vtreetableOf<Data>();

export default componentWithStore(
  // @vue/component
  {
    name: "RepositoryPageTabTree",
    mixins: [ds.createMixin("RepositoryPageTabTree")],
    props: {
      sha: p(String).required,
      rootNodes: p.ofRoArray<LsTreeEntry>().required
    },
    data() {
      return {
        selectedPath: "",
        displayState: {
          columnWidths: {} as Dict<number>,
          splitterPosition: 0.25
        }
      };
    },
    computed: {
      columns(): VtableColumn[] {
        return [
          { id: "name", defaultWidth: 300 },
          { id: "extension", defaultWidth: 80, className: style.lastCell }
        ];
      }
    },
    methods: {
      onRowclick({ item, event }: RowEventArgs) {
        if (event.button !== 0) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        (this.$refs.tree as Vtreetable<Data>).toggleExpand(item.data);
      },
      renderCell({ item, columnId }: VtableSlotCellProps): VNode[] | string {
        const { path, type } = item.data;
        switch (columnId) {
          case "name":
            return [
              <ExpandableCell nodeState={item}>
                {getFileName(path)}
              </ExpandableCell>
            ];
          case "extension":
            return type === "blob" ? getExtension(path) : "";
          default:
            return "NOT IMPLEMENTED: " + columnId;
        }
      }
    },
    render(): VNode {
      return (
        <VSplitterPanel
          class={style.container}
          direction="horizontal"
          splitterWidth={5}
          ratio={__sync(this.displayState.splitterPosition)}
          minSizeFirst="10%"
          minSizeSecond="10%"
        >
          <VtreeTableT
            ref="tree"
            slot="first"
            style={{ flex: 1 }}
            columns={this.columns}
            rootNodes={this.rootNodes}
            indentWidth={12}
            rowHeight={24}
            getItemKey={item => item.path}
            widths={__sync(this.displayState.columnWidths)}
            scopedSlots={{
              cell: this.renderCell
            }}
            onRowclick={this.onRowclick}
          />
          <div slot="second" style={{ margin: "auto" }}>
            <span class="md-headline" style={{ color: "gray" }}>
              NOT IMPLEMENTED
            </span>
          </div>
        </VSplitterPanel>
      );
    }
  },
  ["sha", "rootNodes"]
);
