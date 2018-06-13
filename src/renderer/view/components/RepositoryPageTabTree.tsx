import * as _ from "lodash";
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
import { getExtension } from "core/utils";
import { __sync } from "view/utils/modifiers";
import VSplitterPanel from "./base/VSplitterPanel";
import VBackdropSpinner from "./base/VBackdropSpinner";
import BlamePanel from "./BlamePanel";
import { browserCommand } from "core/browser";
import VTextField from "./base/VTextField";
import { filterTreeNodes } from "core/tree";

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
        filterText: "" as string,
        filterFunc: undefined as ((entry: Data) => boolean) | undefined,
        selectedPath: "",
        selectedBlame: undefined as Blame | undefined,
        loading: false,
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
      },
      filteredRoots(): ReadonlyArray<LsTreeEntry> {
        if (this.filterFunc === undefined) {
          return this.rootNodes;
        } else {
          return filterTreeNodes(this.rootNodes, this.filterFunc);
        }
      },
      rightPanel(): VNode[] {
        const ret = [] as VNode[];
        if (this.selectedBlame) {
          ret.push(
            <BlamePanel
              path={this.selectedPath}
              blame={this.selectedBlame}
              sha={this.sha}
              style={{ margin: "0 0.2em" }}
            />
          );
        } else {
          ret.push(
            <md-empty-state
              style={{ transition: "none !important" }}
              md-icon="no_sim"
              md-label="No file selected"
              md-description="Select file, and blame information will be shown here"
            />
          );
        }
        if (this.loading) {
          ret.push(<VBackdropSpinner key="spinner" />);
        }
        return ret;
      }
    },
    watch: {
      filterText: _.debounce(function(this: any, value: string) {
        if (value) {
          this.filterFunc = (v: Data) => v.basename.indexOf(value) >= 0;
        } else {
          this.filterFunc = undefined;
        }
      }, 500)
    },
    methods: {
      getRowClass({ data }: TreeNodeWithState): string | undefined {
        if (data.path === this.selectedPath) {
          return style.selectedRow;
        } else {
          return undefined;
        }
      },
      onRowclick({ item, event }: RowEventArgs) {
        if (event.button !== 0) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        (this.$refs.tree as Vtreetable<Data>).toggleExpand(item.data);
      },
      async onRowdblclick({ item, event }: RowEventArgs) {
        const { path: relPath, type } = item.data;
        if (event.button !== 0 || type === "tree") {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        try {
          this.loading = true;
          const { sha } = this;
          const { repoPath } = this.$store.state;
          const blame = await browserCommand.getBlame({
            repoPath,
            relPath,
            sha
          });
          this.selectedPath = relPath;
          this.selectedBlame = blame;
        } catch (e) {
          this.$store.actions.showError(e);
        } finally {
          this.loading = false;
        }
      },
      renderCell({ item, columnId }: VtableSlotCellProps): VNode[] | string {
        const { basename, type } = item.data;
        switch (columnId) {
          case "name":
            return [
              <ExpandableCell nodeState={item}>{basename}</ExpandableCell>
            ];
          case "extension":
            return type === "blob" ? getExtension(basename) : "";
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
          <template slot="first">
            <VTextField
              class={style.filterField}
              inlineIcon="filter_list"
              tooltip="Filename filter"
              value={__sync(this.filterText)}
            />
            <VtreeTableT
              ref="tree"
              slot="first"
              style={{ flex: 1 }}
              columns={this.columns}
              rootNodes={this.filteredRoots}
              indentWidth={12}
              rowHeight={24}
              getItemKey={item => item.path}
              getRowClass={this.getRowClass}
              widths={__sync(this.displayState.columnWidths)}
              scopedSlots={{
                cell: this.renderCell
              }}
              onRowclick={this.onRowclick}
              onRowdblclick={this.onRowdblclick}
            />
          </template>
          <div slot="second" class={style.rightPanel}>
            {this.rightPanel}
          </div>
        </VSplitterPanel>
      );
    }
  },
  ["sha", "rootNodes"]
);
