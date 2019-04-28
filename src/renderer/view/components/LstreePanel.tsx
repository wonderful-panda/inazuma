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
import p from "vue-strict-prop";
import { VNode } from "vue";
import * as ds from "view/store/displayState";
import { getExtension } from "core/utils";
import { __sync } from "view/utils/modifiers";
import VSplitterPanel from "./base/VSplitterPanel";
import VBackdropSpinner from "./base/VBackdropSpinner";
import BlamePanel from "./BlamePanel";
import { browserCommand } from "core/browser";
import VTextField from "./base/VTextField";
import { filterTreeNodes } from "core/tree";
import { MdEmptyState } from "./base/md";
import * as emotion from "emotion";
import VIconButton from "./base/VIconButton";
import { withStore, rootModule } from "view/store";
const css = emotion.css;

type Data = LsTreeEntry["data"];
type TreeNodeWithState = TreeNodeWithState_<Data>;
type VtableSlotCellProps = VtableSlotCellProps_<TreeNodeWithState>;
type RowEventArgs = RowEventArgs_<TreeNodeWithState, MouseEvent>;
const VtreeTableT = vtreetableOf<Data>();

const displayState = ds.createMixin("RepositoryPageTabTree", {
  columnWidths: {} as Dict<number>,
  splitterPosition: 0.25
});

// @vue/component
export default withStore.mixin(displayState).create({
  name: "LstreePanel",
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
      loading: false
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
          <MdEmptyState
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
    ...rootModule.mapActions(["showError"]),
    expandFileTreeAll() {
      const tree = this.$refs.tree as Vtreetable<any>;
      tree.expandAll();
    },
    collapseFileTreeAll() {
      const tree = this.$refs.tree as Vtreetable<any>;
      tree.collapseAll();
    },
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
        const { repoPath } = this.state;
        const blame = await browserCommand.getBlame({
          repoPath,
          relPath,
          sha
        });
        this.selectedPath = relPath;
        this.selectedBlame = blame;
      } catch (e) {
        this.showError(e);
      } finally {
        this.loading = false;
      }
    },
    renderCell({ item, columnId }: VtableSlotCellProps): VNode[] | string {
      const { basename, type } = item.data;
      switch (columnId) {
        case "name":
          return [<ExpandableCell nodeState={item}>{basename}</ExpandableCell>];
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
          <div style={{ display: "flex" }}>
            <VTextField
              class={style.filterField}
              inlineIcon="filter_list"
              tooltip="Filename filter"
              size={1}
              value={__sync(this.filterText)}
            />
            <VIconButton
              class={style.expandButton}
              tooltip="Expand all"
              action={this.expandFileTreeAll}
            >
              expand_more
            </VIconButton>
            <VIconButton
              class={style.expandButton}
              tooltip="Collapse all"
              action={this.collapseFileTreeAll}
            >
              expand_less
            </VIconButton>
          </div>
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
});

const style = {
  container: css`
    display: flex;
    flex: 1;
    padding: 1em;

    svg {
      fill: #ddd;
    }

    .vlist-container {
      border: 1px solid gray;
    }
    .vlist-row {
      font-family: var(--monospace-fontfamily);
      user-select: none;
      cursor: default;

      &:nth-child(2n) {
        background-color: #282828;
      }

      &:hover {
        background-color: #383838;
      }
    }

    .vlist-header-row {
      border-bottom: solid 1px #aaa;
      user-select: none;
      cursor: default;
    }

    .vtable-splitter {
      border-right: solid 1px #555;
    }

    .vtable-dragging-splitter {
      background-color: #888;
    }
  `,
  selectedRow: css`
    background-color: #484848;
  `,
  rightPanel: css`
    position: relative;
    flex: 1;
    display: flex;
  `,
  noFileSelected: css`
    margin: auto;
    color: gray !important;
  `,
  lastCell: css`
    flex: 1;
  `,
  filterField: css`
    margin: 0 0 0.5em 0;
    padding: 0;
    min-height: 0;
    font-size: small;
    flex: 1;
  `,
  expandButton: css`
    min-width: 32px;
    max-width: 32px;
    min-height: 32px;
    max-height: 32px;
    margin-right: 0;
  `
};
