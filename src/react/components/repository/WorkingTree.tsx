import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce } from "lodash";
import * as monaco from "monaco-editor";
import { FlexCard } from "../FlexCard";
import { decodeBase64, decodeToString } from "@/strings";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { VirtualListMethods } from "../VirtualList";
import { Button, useTheme } from "@mui/material";
import { useDispatch, useSelector } from "@/store";
import { STAGE, UNSTAGE } from "@/store/thunk/staging";
import { BEGIN_COMMIT } from "@/store/thunk/beginCommit";
import { useTreeModel, TreeItemVM } from "@/hooks/useTreeModel";
import { TreeItem } from "@/tree";
import { VirtualTree, VirtualTreeProps } from "../VirtualTree";
import { FileListRow } from "./FileListRow";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useTreeItemSelector } from "@/hooks/useTreeItemSelector";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import classNames from "classnames";
import { executeFileCommand } from "@/commands";
import { diffStaged, diffUnstaged } from "@/commands/diff";
import { stage, unstage } from "@/commands/staging";
import { IconActionItem } from "@/commands/types";
import { RowActionButtons } from "./RowActionButtons";
import { MonacoEditor } from "../MonacoEditor";
import AutoSizer from "react-virtualized-auto-sizer";
import { useFixup, FIXUP_DESC } from "@/hooks/useFixup";
import { REPORT_ERROR } from "@/store/misc";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { invokeTauriCommand } from "@/invokeTauriCommand";

export interface WorkingTreeProps {
  stat: WorkingTreeStat | undefined;
  orientation: Orientation;
}

type RowType = FileEntry | "staged" | "unstaged";

const unstagedActionCommands = [diffUnstaged, stage];
const stagedActionCommands = [diffStaged, unstage];

const getItemKey = (item: RowType) =>
  typeof item === "string" ? item : `${item.path}:${item.unstaged ? "U" : "S"}`;

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

const GroupHeader: React.VFC<{
  type: "staged" | "unstaged";
  index: number;
  height: number;
}> = ({ type, index, height }) => {
  const dispatch = useDispatch();
  const selectedIndex = useSelectedIndex();
  const headerActions = useMemo(() => {
    const action: IconActionItem =
      type === "unstaged"
        ? {
          id: "StageAll",
          label: "Stage all files",
          icon: "mdi:plus",
          handler: () => dispatch(STAGE("*"))
        }
        : {
          id: "UnstageAll",
          label: "Unstage all files",
          icon: "mdi:minus",
          handler: () => dispatch(UNSTAGE("*"))
        };
    return [action];
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

const UdiffViewer: React.VFC<{ udiff: Udiff | undefined }> = ({ udiff }) => {
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

export const WorkingTree: React.VFC<WorkingTreeProps> = ({ stat, orientation }) => {
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
  const { handleKeyDown, handleRowMouseDown } = useTreeItemSelector(treeModelState, treeModelDispatch);

  const fixup = useFixup();
  const commit = useCallback(() => dispatch(BEGIN_COMMIT()), [dispatch]);

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
            const udiff = await getUdiff(repoPath, data.path, !data.unstaged);
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

  const unstaged = useMemo<FileEntry[]>(() => {
    if (!stat) {
      return [];
    }
    return [...stat.unstagedFiles.map((f) => ({ ...f, unstaged: true }))].sort((a, b) =>
      a.path.localeCompare(b.path)
    );
  }, [stat]);

  const staged = useMemo<FileEntry[]>(() => {
    if (!stat) {
      return [];
    }
    return [...stat.stagedFiles].sort((a, b) => a.path.localeCompare(b.path));
  }, [stat]);

  useEffect(() => {
    const rootItems: TreeItem<RowType>[] = [];
    if (unstaged.length > 0) {
      rootItems.push({ data: "unstaged", children: unstaged.map((data) => ({ data })) });
    }
    if (staged.length > 0) {
      rootItems.push({ data: "staged", children: staged.map((data) => ({ data })) });
    }
    treeModelDispatch({ type: "reset", payload: { items: rootItems } });
    treeModelDispatch({ type: "expandAll" });
    if (selectedRowDataRef.current) {
      const key = getItemKey(selectedRowDataRef.current);
      treeModelDispatch({
        type: "selectByPredicate",
        payload: (v) => getItemKey(v.item.data) === key
      });
    }
  }, [treeModelDispatch, unstaged, staged]);

  const handleRowDoubleClick = useCallback(
    (_e: unknown, _index: unknown, { item }: TreeItemVM<RowType>) => {
      if (typeof item.data === "string") {
        treeModelDispatch({ type: "toggleItem", payload: { item } });
      } else {
        if (stat) {
          const command = item.data.unstaged ? diffUnstaged : diffStaged;
          executeFileCommand(command, dispatch, stat, item.data);
        }
      }
    },
    [treeModelDispatch, dispatch, stat]
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
            actionCommands={item.data.unstaged ? unstagedActionCommands : stagedActionCommands}
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
                />
              </SelectedIndexProvider>
            </KeyDownTrapper>
          }
          actions={
            <>
              <Button
                title={FIXUP_DESC}
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
