import _ from "lodash";
import {
  vtreetableOf,
  ExpandableCell,
  VtableColumn,
  TreeNodeWithState as TreeNodeWithState_,
  VtableSlotCellProps as VtableSlotCellProps_,
  RowEventArgs as RowEventArgs_,
  Vtreetable
} from "vue-vtable";
import * as vca from "vue-tsx-support/lib/vca";
import { getExtension } from "core/utils";
import { __sync } from "view/utils/modifiers";
import VSplitterPanel from "./base/VSplitterPanel";
import VBackdropSpinner from "./base/VBackdropSpinner";
import BlamePanel from "./BlamePanel";
import { browserCommand } from "core/browser";
import VTextField from "./base/VTextField";
import { filterTreeNodes } from "core/tree";
import { MdEmptyState } from "./base/md";
import { css } from "@emotion/css";
import VIconButton from "./base/VIconButton";
import { SplitterDirection } from "view/mainTypes";
import { ref, watch, computed, reactive } from "@vue/composition-api";
import { withclass } from "./base/withClass";
import { injectErrorHandler } from "./injection/errorHandler";
import { injectStorage, useStorage } from "./injection/storage";
import { required, optional } from "./base/prop";

type Data = LsTreeEntry["data"];
type TreeNodeWithState = TreeNodeWithState_<Data>;
type VtableSlotCellProps = VtableSlotCellProps_<TreeNodeWithState>;
type RowEventArgs = RowEventArgs_<TreeNodeWithState, MouseEvent>;
const VtreeTableT = vtreetableOf<Data>();

const style = {
  container: css`
    display: flex;
    flex: 1;
    padding: 1em;
  `,
  selectedRow: css`
    background-color: #484848;
  `,
  leftPanel: css`
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    padding: 0;
    margin: 0;

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
  `
};

const treeViewColumns: VtableColumn[] = [
  { id: "name", defaultWidth: 300 },
  { id: "extension", defaultWidth: 80, className: style.lastCell }
];

const ExpandButton = withclass(VIconButton)(
  css`
    min-width: 32px;
    max-width: 32px;
    min-height: 32px;
    max-height: 32px;
    margin-right: 0;
  `
);

const FilterToolbar = vca.component({
  name: "FilterToolbar",
  props: {
    filterText: required(String),
    expandAll: required(Function),
    collapseAll: required(Function)
  },
  setup(p, ctx) {
    const update = vca.updateEmitter<typeof p>();
    const filterText = computed({
      get: () => p.filterText,
      set: v => update(ctx, "filterText", v)
    });
    return () => (
      <div style={{ display: "flex" }}>
        <VTextField
          class={style.filterField}
          inlineIcon="filter_list"
          tooltip="Filename filter"
          size={1}
          value={__sync(filterText.value)}
        />
        <ExpandButton tooltip="Expand all" action={p.expandAll}>
          expand_more
        </ExpandButton>
        <ExpandButton tooltip="Collapse all" action={p.collapseAll}>
          expand_less
        </ExpandButton>
      </div>
    );
  }
});

const LeftPanel = vca.component({
  name: "LstreeLeftPanel",
  props: {
    rootNodes: required<readonly LsTreeEntry[]>(Array),
    columnWidths: required<Record<string, number>>(Object),
    selectedPath: required(String)
  },
  setup(props, ctx) {
    const emitUpdate = vca.updateEmitter<typeof props>();
    const filterText = ref("");
    const filteredRoots = ref(props.rootNodes);
    watch(
      filterText,
      _.debounce((value: string) => {
        if (!value) {
          filteredRoots.value = props.rootNodes;
        } else {
          const predicate = (v: Data) => v.basename.indexOf(value) >= 0;
          filteredRoots.value = filterTreeNodes(props.rootNodes, predicate);
        }
      }, 500)
    );
    const tree = ref<null | Vtreetable<any>>(null);
    const expandAll = () => tree.value?.expandAll();
    const collapseAll = () => tree.value?.collapseAll();
    const getRowClass = ({ data }: TreeNodeWithState) => {
      return data.path === props.selectedPath ? style.selectedRow : undefined;
    };
    const onRowclick = ({ item, event }: RowEventArgs) => {
      if (event.button !== 0) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      tree.value?.toggleExpand(item.data);
    };
    const onRowdblclick = ({ item, event }: RowEventArgs) => {
      const { path, type } = item.data;
      if (event.button !== 0 || type === "tree") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();

      emitUpdate(ctx, "selectedPath", path);
    };

    const renderCell = ({ item, columnId }: VtableSlotCellProps) => {
      const { basename, type } = item.data;
      switch (columnId) {
        case "name":
          return <ExpandableCell nodeState={item}>{basename}</ExpandableCell>;
        case "extension":
          return type === "blob" ? getExtension(basename) : "";
        default:
          return "NOT IMPLEMENTED: " + columnId;
      }
    };

    return () => {
      return (
        <div class={style.leftPanel}>
          <FilterToolbar
            filterText={__sync(filterText.value)}
            expandAll={expandAll}
            collapseAll={collapseAll}
          />
          <VtreeTableT
            ref={tree}
            style={{ flex: 1 }}
            columns={treeViewColumns}
            rootNodes={filteredRoots.value}
            indentWidth={12}
            rowHeight={24}
            getItemKey={item => item.path}
            getRowClass={getRowClass}
            widths={__sync(props.columnWidths, v =>
              emitUpdate(ctx, "columnWidths", v)
            )}
            scopedSlots={{
              cell: renderCell
            }}
            onRowclick={onRowclick}
            onRowdblclick={onRowdblclick}
          />
        </div>
      );
    };
  }
});

const RightPanel = vca.component({
  name: "LstreeRightPanel",
  props: {
    loading: required(Boolean),
    path: required(String),
    sha: required(String),
    blame: optional<Blame>(Object)
  },
  setup(props) {
    return () => {
      const content = props.blame ? (
        <BlamePanel
          path={props.path}
          blame={props.blame}
          sha={props.sha}
          style={{ margin: "0 0.2em" }}
        />
      ) : (
        <MdEmptyState
          style={{ transition: "none !important" }}
          md-icon="no_sim"
          md-label="No file selected"
          md-description="Select file, and blame information will be shown here"
        />
      );

      return (
        <div class={style.rightPanel}>
          {content}
          {props.loading ? <VBackdropSpinner key="spinner" /> : undefined}
        </div>
      );
    };
  }
});

const LstreePanel = vca.component({
  name: "LstreePanel",
  props: {
    repoPath: required(String),
    sha: required(String),
    rootNodes: required<readonly LsTreeEntry[]>(Array)
  },
  setup(props) {
    const state = reactive({
      loading: false,
      treePath: "",
      blamePath: "",
      blame: undefined as undefined | Blame
    });
    const errorHandler = injectErrorHandler();
    const storage = injectStorage();
    const persistState = useStorage(
      {
        columnWidths: {} as Record<string, number>,
        splitter: { ratio: 0.25, direction: "horizontal" as SplitterDirection }
      },
      storage,
      "LsTreePanel"
    );

    watch(
      () => state.treePath,
      async value => {
        if (!value) {
          state.blamePath = "";
          state.blame = undefined;
          return;
        }
        try {
          state.loading = true;
          const blame = await browserCommand.getBlame({
            repoPath: props.repoPath,
            relPath: value,
            sha: props.sha
          });
          state.blamePath = value;
          state.blame = blame;
        } catch (error) {
          errorHandler.handleError({ error });
        } finally {
          state.loading = false;
        }
      }
    );

    return () => {
      return (
        <VSplitterPanel
          class={style.container}
          allowDirectionChange
          direction={__sync(persistState.splitter.direction)}
          splitterWidth={5}
          ratio={__sync(persistState.splitter.ratio)}
        >
          <LeftPanel
            slot="first"
            rootNodes={props.rootNodes}
            selectedPath={__sync(state.treePath)}
            columnWidths={__sync(persistState.columnWidths)}
          />
          <RightPanel
            slot="second"
            loading={state.loading}
            path={state.blamePath}
            sha={props.sha}
            blame={state.blame}
          />
        </VSplitterPanel>
      );
    };
  }
});

export default LstreePanel;
