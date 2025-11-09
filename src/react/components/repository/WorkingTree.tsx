import { Button, useTheme } from "@mui/material";
import classNames from "classnames";
import { useAtomValue } from "jotai";
import { debounce } from "lodash";
import type * as monaco from "monaco-editor";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { executeFileCommand } from "@/commands";
import { useCopyRelativePathCommand } from "@/commands/copyRelativePath";
import {
  useDiffUnstagedCommand,
  useDiffWithParent2Command,
  useDiffWithParentCommand
} from "@/commands/diff";
import type { IconActionItem } from "@/commands/types";
import { useRestoreCommand, useStageCommand, useUnstageCommand } from "@/commands/workingtree";
import { useAlert } from "@/context/AlertContext";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import {
  useBeginCommit,
  useFixup,
  useRestore,
  useStage,
  useUnstage
} from "@/hooks/actions/workingtree";
import { useFileContextMenuT } from "@/hooks/useContextMenu";
import { useElementSize } from "@/hooks/useElementSize";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { useTreeIndexChanger } from "@/hooks/useTreeIndexChanger";
import { type TreeItemVM, useTreeModel } from "@/hooks/useTreeModel";
import { useWithRef } from "@/hooks/useWithRef";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { repoPathAtom } from "@/state/repository";
import { decodeBase64, decodeToString } from "@/strings";
import type { TreeItem } from "@/tree";
import { FlexCard } from "../FlexCard";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { MonacoEditor } from "../MonacoEditor";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import type { VirtualListMethods } from "../VirtualList";
import { VirtualTree, type VirtualTreeProps } from "../VirtualTree";
import { FileListRow } from "./FileListRow";
import { NumStat } from "./NumStat";
import PathFilter from "./PathFilter";
import { RowActionButtons } from "./RowActionButtons";

export interface WorkingTreeProps {
  stat: WorkingTreeStat | undefined;
  orientation: Orientation;
}
type GroupHeaderType = "staged" | "unstaged" | "conflict";
interface HeaderRowType {
  headerType: GroupHeaderType;
  files: readonly WorkingTreeFileEntry[];
}
type RowType = WorkingTreeFileEntry | HeaderRowType;

const getItemKey = (item: RowType) =>
  "headerType" in item ? item.headerType : `${item.path}:${item.kind.type}`;

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
  header: HeaderRowType;
  index: number;
  height: number;
  childItems?: readonly TreeItem<RowType>[];
}> = ({ header, index, height, childItems }) => {
  const selectedIndex = useSelectedIndex();
  const stage = useStage();
  const unstage = useUnstage();
  const restore = useRestore();
  const [, visibleFilesRef] = useWithRef(
    useMemo(
      () =>
        (childItems ?? [])
          .filter((c) => !("headerType" in c.data))
          .map((c) => c.data as WorkingTreeFileEntry),
      [childItems]
    )
  );
  const headerActions = useMemo<IconActionItem[]>(() => {
    if (header.headerType === "unstaged") {
      return [
        {
          id: "RestoreAll",
          label: "Restore all files(discard all unstaged changes)",
          icon: "mdi:undo",
          handler: () =>
            void restore(
              visibleFilesRef.current.filter((f) => f.statusCode !== "?").map((f) => f.path)
            )
        },
        {
          id: "StageAll",
          label: "Stage all files",
          icon: "mdi:plus",
          handler: () => void stage(visibleFilesRef.current.map((f) => f.path))
        }
      ];
    } else if (header.headerType === "staged") {
      return [
        {
          id: "UnstageAll",
          label: "Unstage all files",
          icon: "mdi:minus",
          handler: () => void unstage(visibleFilesRef.current.map((f) => f.path))
        }
      ];
    } else {
      return [];
    }
  }, [header.headerType, stage, unstage, restore]);

  return (
    <div
      className={classNames(
        "relative flex-row-nowrap items-center pl-2 flex-1 text-lg font-bold cursor-pointer overflow-hidden select-none group",
        selectedIndex === index ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
      style={{ height }}
    >
      <span className="flex-1">{header.headerType}</span>
      <RowActionButtons actions={headerActions} size={height} />
      <span className="ml-4 text-base">
        <NumStat files={header.files} />
      </span>
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
  const [containerRef] = useElementSize(handleResize);
  const content = getUdiffContent(udiff);
  return (
    <div
      ref={containerRef}
      className="flex-1 grid grid-rows-1 grid-cols-1 overflow-hidden border border-paper"
    >
      <MonacoEditor
        options={options}
        language="unified-diff"
        value={content}
        onEditorMounted={handleEditorMounted}
      />
    </div>
  );
};

const filesToItems = (files: readonly WorkingTreeFileEntry[], filterText: string) => {
  return files
    .filter((f) => f.path.includes(filterText))
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((data) => ({ data }));
};

const getGroupHeaderItem = (
  headerType: GroupHeaderType,
  files: readonly WorkingTreeFileEntry[],
  filterText: string
) => {
  return {
    data: {
      headerType,
      files
    },
    children: filesToItems(files, filterText)
  };
};

export const WorkingTree: React.FC<WorkingTreeProps> = ({ stat, orientation }) => {
  const repoPath = useAtomValue(repoPathAtom);
  const theme = useTheme();
  const rowHeight = theme.custom.baseFontSize * 3;
  const headerRowHeight = rowHeight * 0.75;
  const itemSize = useCallback(
    (data: RowType) => {
      if ("headerType" in data) {
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
  const [treeModelState, treeModelDispatch] = useTreeModel<RowType>(getItemKey);
  const { handleKeyDown, handleRowMouseDown } = useTreeIndexChanger(
    treeModelState,
    treeModelDispatch
  );

  const copyRelativePath = useCopyRelativePathCommand();
  const restore = useRestoreCommand();
  const diffUnstaged = useDiffUnstagedCommand();
  const diffWithParent = useDiffWithParentCommand();
  const diffWithParent2 = useDiffWithParent2Command();
  const stage = useStageCommand();
  const unstage = useUnstageCommand();

  const actionCommands = useMemo(
    () => [
      copyRelativePath,
      restore,
      diffUnstaged,
      diffWithParent,
      diffWithParent2,
      stage,
      unstage
    ],
    [copyRelativePath, restore, diffUnstaged, diffWithParent, diffWithParent2, stage, unstage]
  );
  const { reportError } = useAlert();

  const beginCommit = useBeginCommit();
  const fixup = useFixup();

  useEffect(() => {
    treeRef.current?.scrollToItem(treeModelState.selectedIndex);
  }, [treeModelState.selectedIndex]);
  const selectFile = useMemo(
    () =>
      debounce(async (data: RowType | undefined) => {
        if (!repoPath) {
          return;
        }
        if (!data || "headerType" in data) {
          setUdiff(undefined);
        } else {
          try {
            const udiff = await getUdiff(repoPath, data.path, data.kind.type === "staged");
            setUdiff(udiff);
          } catch (error) {
            reportError({ error });
          }
        }
      }, 200),
    [repoPath, reportError]
  );
  useEffect(() => {
    void selectFile(treeModelState.selectedItem?.item.data);
  }, [selectFile, treeModelState.selectedItem]);

  useEffect(() => {
    selectedRowDataRef.current = treeModelState.selectedItem?.item.data;
  }, [treeModelState.selectedItem]);

  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    const items: TreeItem<RowType>[] = [];
    items.push({ data: { headerType: "conflict", files: [] }, children: [] });
    items.push({ data: { headerType: "unstaged", files: [] }, children: [] });
    items.push({ data: { headerType: "staged", files: [] }, children: [] });
    treeModelDispatch({ type: "reset", payload: { items } });
    treeModelDispatch({ type: "expandAll" });
  }, [treeModelDispatch]);

  const unmergedHeader = useMemo(
    () => getGroupHeaderItem("conflict", stat?.unmergedFiles ?? [], filterText),
    [stat?.unmergedFiles, filterText]
  );
  const unstagedHeader = useMemo(
    () => getGroupHeaderItem("unstaged", stat?.unstagedFiles ?? [], filterText),
    [stat?.unstagedFiles, filterText]
  );
  const stagedHeader = useMemo(
    () => getGroupHeaderItem("staged", stat?.stagedFiles ?? [], filterText),
    [stat?.stagedFiles, filterText]
  );
  useEffect(() => {
    const rootItems = [unmergedHeader, unstagedHeader, stagedHeader].filter(
      (h) => h.children.length > 0
    );
    treeModelDispatch({ type: "reset", payload: { items: rootItems } });
    if (selectedRowDataRef.current) {
      const key = getItemKey(selectedRowDataRef.current);
      treeModelDispatch({
        type: "selectByPredicate",
        payload: (v) => getItemKey(v.item.data) === key
      });
    }
  }, [treeModelDispatch, unmergedHeader, unstagedHeader, stagedHeader]);

  const handleRowDoubleClick = useCallback(
    (_e: unknown, _index: unknown, { item }: TreeItemVM<RowType>) => {
      if ("headerType" in item.data) {
        treeModelDispatch({ type: "toggleItem", payload: { item } });
      } else {
        if (stat) {
          const command = item.data.kind.type === "unstaged" ? diffUnstaged : diffWithParent;
          executeFileCommand(command, stat, item.data);
        }
      }
    },
    [treeModelDispatch, diffUnstaged, diffWithParent, stat]
  );

  const handleRowContextMenu = useFileContextMenuT<TreeItemVM<RowType>>(
    stat,
    useCallback((vm) => ("headerType" in vm.item.data ? undefined : vm.item.data), [])
  );

  const renderRow = useCallback<VirtualTreeProps<RowType>["renderRow"]>(
    (item, index) => {
      if ("headerType" in item.data) {
        return (
          <GroupHeader
            header={item.data}
            index={index}
            height={headerRowHeight}
            childItems={item.children}
          />
        );
      } else {
        if (!stat) {
          return null;
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
    [stat, rowHeight, headerRowHeight, actionCommands]
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
                disabled={stagedHeader.data.files.length === 0}
                onClick={fixup as VoidReturn<typeof fixup>}
                color="inherit"
              >
                Fixup
              </Button>
              <Button
                title="Commit staged changes"
                onClick={beginCommit as VoidReturn<typeof beginCommit>}
                color="inherit"
              >
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
