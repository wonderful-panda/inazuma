import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import * as monaco from "monaco-editor";
import { FlexCard } from "../FlexCard";
import { decodeBase64, decodeToString } from "@/strings";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { VirtualListMethods } from "../VirtualList";
import { Button, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "@/store";
import { STAGE, UNSTAGE } from "@/store/thunk/workingtree";
import { BEGIN_COMMIT } from "@/store/thunk/beginCommit";
import { FIXUP } from "@/store/thunk/commit";
import { useTreeModel, TreeItemVM } from "@/hooks/useTreeModel";
import { TreeItem } from "@/tree";
import { VirtualTree, VirtualTreeProps } from "../VirtualTree";
import { FileListRow } from "./FileListRow";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useTreeIndexChanger } from "@/hooks/useTreeIndexChanger";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import classNames from "classnames";
import { executeFileCommand } from "@/commands";
import { diffUnstaged, diffWithParent, diffWithParent2 } from "@/commands/diff";
import { stage, unstage, restore } from "@/commands/workingtree";
import { IconActionItem } from "@/commands/types";
import { RowActionButtons } from "./RowActionButtons";
import { MonacoEditor } from "../MonacoEditor";
import AutoSizer from "react-virtualized-auto-sizer";
import { REPORT_ERROR } from "@/store/misc";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import PathFilter from "./PathFilter";
import { useFileContextMenuT } from "@/hooks/useContextMenu";
import { copyRelativePath } from "@/commands/copyRelativePath";

export interface WorkingTreeProps {
  stat: WorkingTreeStat | undefined;
  orientation: Orientation;
}
type GroupHeaderType = "staged" | "unstaged" | "conflict";
type RowType = WorkingTreeFileEntry | GroupHeaderType;

const actionCommands = [
  copyRelativePath,
  restore,
  diffUnstaged,
  diffWithParent,
  diffWithParent2,
  stage,
  unstage
];

const getItemKey = (item: RowType) =>
  typeof item === "string" ? item : `${item.path}:${item.kind.type}`;

const getUdiff = async (repoPath: string, relPath: string, cached: boolean): Promise<Udiff> => {
  const udiffBase64 = await invokeTauriCommand("get_workingtree_udiff_base64", {
    repoPath,
    relPath,
    cached
  });
  const decoded = decodeToString(decodeBase64(udiffBase64));
  if (decoded.text.length === 0) {
    return { type: "nodiff" };
  } else {
    const index = decoded.text.search(/^@@/m);
    if (index < 0) {
      return { type: "binary" };
    } else {
      return { type: "text", content: decoded.text.slice(index) };
    }
  }
};

const GroupHeader: React.FC<{
  type: GroupHeaderType;
  index: number;
  height: number;
}> = ({ type, index, height }) => {
  const dispatch = useDispatch();
  const selectedIndex = useSelectedIndex();
  const headerActions = useMemo<IconActionItem[]>(() => {
    if (type === "unstaged") {
      return [
        {
          id: "StageAll",
          label: "Stage all files",
          icon: "mdi:plus",
          handler: () => dispatch(STAGE("*"))
        }
      ];
    } else if (type === "staged") {
      return [
        {
          id: "UnstageAll",
          label: "Unstage all files",
          icon: "mdi:minus",
          handler: () => dispatch(UNSTAGE("*"))
        }
      ];
    } else {
      return [];
    }
  }, [type, dispatch]);

  return (
    <div
      className={classNames(
        "flex-row-nowrap items-center pl-2 flex-1 text-xl cursor-pointer overflow-hidden select-none group",
        selectedIndex === index ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
      style={{ height }}
    >
      <span className="flex-1">{type}</span>
      <RowActionButtons actions={headerActions} size={height * 0.8} />
    </div>
  );
};

const getUdiffContent = (udiff: Udiff | undefined): string => {
  if (!udiff) {
    return "<< NO FILE SELECTED >>";
  } else if (udiff.type === "text") {
    return udiff.content;
  } else if (udiff.type === "binary") {
    return "<< BINARY FILE >>";
  } else {
    return "<< NO DIFFERENCE >>";
  }
};

const UdiffViewer: React.FC<{ udiff: Udiff | undefined }> = ({ udiff }) => {
  const theme = useTheme();
  const options = useMemo<monaco.editor.IEditorConstructionOptions>(
    () => ({
      readOnly: true,
      folding: false,
      minimap: { enabled: false },
      selectOnLineNumbers: false,
      lineNumbers: "off",
      fontSize: theme.custom.baseFontSize
    }),
    [theme.custom.baseFontSize]
  );
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const handleEditorMounted = useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    setEditor(editor);
  }, []);
  const handleResize = useCallback(() => {
    editor?.layout();
  }, [editor]);
  const content = getUdiffContent(udiff);
  return (
    <div className="relative flex-1 overflow-hidden m-1 border border-solid border-paper">
      <AutoSizer className="flex flex-1 overflow-hidden" onResize={handleResize}>
        {() => (
          <MonacoEditor
            className="absolute top-0 bottom-0 left-0 right-0"
            options={options}
            language="unified-diff"
            value={content}
            onEditorMounted={handleEditorMounted}
          />
        )}
      </AutoSizer>
    </div>
  );
};

const filesToItems = (files: readonly WorkingTreeFileEntry[], filterText: string) => {
  return files
    .filter((f) => f.path.indexOf(filterText) >= 0)
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((data) => ({ data }));
};

export const WorkingTree: React.FC<WorkingTreeProps> = ({ stat, orientation }) => {
  const dispatch = useDispatch();

  const repoPath = useSelector((state) => state.repository.path);
  const theme = useTheme();
  const rowHeight = theme.custom.baseFontSize * 3;
  const headerRowHeight = rowHeight * 0.75;
  const itemSize = useCallback(
    (data: RowType) => {
      if (typeof data === "string") {
        return headerRowHeight;
      } else {
        return rowHeight;
      }
    },
    [rowHeight, headerRowHeight]
  );
  const treeRef = useRef<VirtualListMethods>(null);
  const [udiff, setUdiff] = useState<Udiff | undefined>(undefined);
  const selectedRowDataRef = useRef<RowType | undefined>(undefined);
  const [treeModelState, treeModelDispatch] = useTreeModel<RowType>();
  const { handleKeyDown, handleRowMouseDown } = useTreeIndexChanger(
    treeModelState,
    treeModelDispatch
  );

  const commit = useCallback(() => dispatch(BEGIN_COMMIT()), [dispatch]);
  const fixup = useCallback(() => dispatch(FIXUP()), [dispatch]);

  useEffect(() => {
    treeRef.current?.scrollToItem(treeModelState.selectedIndex);
  }, [treeModelState.selectedIndex]);
  const selectFile = useMemo(
    () =>
      debounce(async (data: RowType | undefined) => {
        if (!repoPath) {
          return;
        }
        if (!data || typeof data === "string") {
          setUdiff(undefined);
        } else {
          try {
            const udiff = await getUdiff(repoPath, data.path, data.kind.type === "staged");
            setUdiff(udiff);
          } catch (error) {
            dispatch(REPORT_ERROR({ error }));
          }
        }
      }, 200),
    [repoPath, dispatch]
  );
  useEffect(() => {
    selectFile(treeModelState.selectedItem?.item.data);
  }, [selectFile, treeModelState.selectedItem]);

  useEffect(() => {
    selectedRowDataRef.current = treeModelState.selectedItem?.item.data;
  }, [treeModelState.selectedItem]);

  const [filterText, setFilterText] = useState("");

  const unmerged = useMemo(() => {
    if (!stat) {
      return [];
    }
    return filesToItems(stat.unmergedFiles, filterText);
  }, [stat, filterText]);

  const unstaged = useMemo(() => {
    if (!stat) {
      return [];
    }
    return filesToItems(stat.unstagedFiles, filterText);
  }, [stat, filterText]);

  const staged = useMemo(() => {
    if (!stat) {
      return [];
    }
    return filesToItems(stat.stagedFiles, filterText);
  }, [stat, filterText]);

  useEffect(() => {
    const items: TreeItem<RowType>[] = [];
    items.push({ data: "conflict", children: [] });
    items.push({ data: "unstaged", children: [] });
    items.push({ data: "staged", children: [] });
    treeModelDispatch({ type: "reset", payload: { items } });
    treeModelDispatch({ type: "expandAll" });
  }, [treeModelDispatch]);

  useEffect(() => {
    const rootItems: TreeItem<RowType>[] = [];
    if (unmerged.length > 0) {
      rootItems.push({ data: "conflict", children: unmerged });
    }
    if (unstaged.length > 0) {
      rootItems.push({ data: "unstaged", children: unstaged });
    }
    if (staged.length > 0) {
      rootItems.push({ data: "staged", children: staged });
    }
    treeModelDispatch({ type: "reset", payload: { items: rootItems } });
    if (selectedRowDataRef.current) {
      const key = getItemKey(selectedRowDataRef.current);
      treeModelDispatch({
        type: "selectByPredicate",
        payload: (v) => getItemKey(v.item.data) === key
      });
    }
  }, [treeModelDispatch, unmerged, unstaged, staged]);

  const handleRowDoubleClick = useCallback(
    (_e: unknown, _index: unknown, { item }: TreeItemVM<RowType>) => {
      if (typeof item.data === "string") {
        treeModelDispatch({ type: "toggleItem", payload: { item } });
      } else {
        if (stat) {
          const command = item.data.kind.type === "unstaged" ? diffUnstaged : diffWithParent;
          executeFileCommand(command, dispatch, stat, item.data);
        }
      }
    },
    [treeModelDispatch, dispatch, stat]
  );

  const handleRowContextMenu = useFileContextMenuT<TreeItemVM<RowType>>(
    stat,
    useCallback((vm) => (typeof vm.item.data === "string" ? undefined : vm.item.data), [])
  );

  const renderRow = useCallback<VirtualTreeProps<RowType>["renderRow"]>(
    (item, index) => {
      if (typeof item.data === "string") {
        return <GroupHeader type={item.data} index={index} height={headerRowHeight} />;
      } else {
        if (!stat) {
          return <></>;
        }
        return (
          <FileListRow
            commit={stat}
            file={item.data}
            height={rowHeight}
            index={index}
            actionCommands={actionCommands}
          />
        );
      }
    },
    [stat, rowHeight, headerRowHeight]
  );

  return (
    <PersistSplitterPanel
      persistKey="repository/WorkingTree"
      initialRatio={0.5}
      initialDirection={orientation === "portrait" ? "vert" : "horiz"}
      allowDirectionChange={false}
      first={
        <FlexCard
          title="Changes"
          content={
            <div className="flex-1 flex-col-nowrap">
              <PathFilter onFilterTextChange={setFilterText} className="m-2" />
              <KeyDownTrapper className="m-1 p-1" onKeyDown={handleKeyDown}>
                <SelectedIndexProvider value={treeModelState.selectedIndex}>
                  <VirtualTree<RowType>
                    treeModelState={treeModelState}
                    treeModelDispatch={treeModelDispatch}
                    itemSize={itemSize}
                    getItemKey={getItemKey}
                    renderRow={renderRow}
                    onRowMouseDown={handleRowMouseDown}
                    onRowDoubleClick={handleRowDoubleClick}
                    onRowContextMenu={handleRowContextMenu}
                  />
                </SelectedIndexProvider>
              </KeyDownTrapper>
            </div>
          }
          actions={
            <>
              <Button
                title="Meld staged changes into last commit without changing message"
                disabled={staged.length === 0}
                onClick={fixup}
                color="inherit"
              >
                Fixup
              </Button>
              <Button title="Commit staged changes" onClick={commit} color="inherit">
                Commit
              </Button>
            </>
          }
        />
      }
      second={<UdiffViewer udiff={udiff} />}
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};
