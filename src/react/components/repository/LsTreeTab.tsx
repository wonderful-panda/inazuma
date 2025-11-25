import { IconButton } from "@mui/material";
import classNames from "classnames";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTauriSuspenseQuery } from "@/hooks/useTauriQuery";
import type { TreeItemVM, TreeModelDispatch } from "@/hooks/useTreeModel";
import { filterTreeItems, sortTree, type TreeItem } from "@/tree";
import { FlexCard } from "../FlexCard";
import { Icon } from "../Icon";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { BlamePanel } from "./BlamePanel";
import { CommitAttributes } from "./CommitAttributes";
import { withLoadingSuspense } from "./LoadingSuspense";
import { LsTree } from "./LsTree";
import PathFilter from "./PathFilter";
import { withRepositoryErrorBoundary } from "./RepositoryErrorBoundary";

export interface LsTreeTabProps {
  repoPath: string;
  commit: Commit;
  refs: Refs | undefined;
}

const LsTreeWithFilter: React.FC<{
  orientation: Orientation;
  commit: Commit;
  entries: readonly LstreeEntry[];
  blamePath: string | undefined;
  onUpdateBlamePath: (value: string | undefined) => void;
}> = ({ orientation, commit, entries, blamePath, onUpdateBlamePath }) => {
  const [filterText, setFilterText] = useState("");
  const filteredEntries = useMemo(() => {
    if (!filterText) {
      return entries;
    }
    return filterTreeItems(entries, (data) => data.path.includes(filterText));
  }, [entries, filterText]);

  const dispatchRef = useRef<TreeModelDispatch<LstreeData> | null>(null);

  const expandAll = useCallback(() => {
    dispatchRef.current?.({ type: "expandAll" });
  }, []);

  const collapseAll = useCallback(() => {
    dispatchRef.current?.({ type: "collapseAll" });
  }, []);

  const getRowClass = useCallback(
    (data: LstreeData) => (data.path === blamePath ? "text-primary font-bold" : undefined),
    [blamePath]
  );

  const handleRowDoubleClick = useCallback(
    (event: React.MouseEvent, _index: number, { item }: TreeItemVM<LstreeData>) => {
      if (event.button === 0) {
        if (item.data.type === "blob") {
          onUpdateBlamePath(item.data.path);
        } else {
          dispatchRef.current?.({ type: "toggleItem", payload: { item } });
        }
      }
    },
    [onUpdateBlamePath]
  );

  const selectedData = useRef<LstreeData | undefined>(undefined);
  const handleSelectionChange = useCallback((_: number, item: TreeItem<LstreeData> | undefined) => {
    selectedData.current = item?.data;
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // get selected data via RefObject to avoid recomputation after selected index changed
      if (event.key === "Enter") {
        if (selectedData.current?.type === "blob") {
          onUpdateBlamePath(selectedData.current.path);
        }
      }
    },
    [onUpdateBlamePath]
  );
  const content = (
    <div
      className={classNames(
        "flex-1",
        orientation === "portrait" ? "flex-col-nowrap" : "flex-row-nowrap"
      )}
    >
      <div className="flex-col-nowrap m-1">
        <div
          className={classNames(
            "mb-2 px-2 border border-greytext",
            orientation === "landscape" && "max-w-2xl"
          )}
        >
          <CommitAttributes commit={commit} showSummary />
        </div>
        <div className="flex-col-nowrap mb-auto p-2">
          <div className="flex-row-nowrap items-end mb-2 mr-2">
            <PathFilter onFilterTextChange={setFilterText} className="flex-1" />
            <IconButton size="small" onClick={expandAll} title="Expand all">
              <Icon icon="mdi:chevron-down" className="text-2xl" />
            </IconButton>
            <IconButton size="small" onClick={collapseAll} title="Collapse all">
              <Icon icon="mdi:chevron-up" className="text-2xl" />
            </IconButton>
          </div>
        </div>
      </div>
      <div className="flex-col-nowrap flex-1 m-1 border border-greytext">
        <LsTree
          dispatchRef={dispatchRef}
          rootItems={filteredEntries}
          onKeyDown={handleKeyDown}
          onSelectionChange={handleSelectionChange}
          onRowDoubleClick={handleRowDoubleClick}
          getRowClass={getRowClass}
        />
      </div>
    </div>
  );
  return (
    <div className="flex flex-1 p-2">
      <FlexCard content={content} />
    </div>
  );
};

const compareEntries = (a: LstreeEntry, b: LstreeEntry): number => {
  if (a.data.type !== b.data.type) {
    return a.data.type === "tree" ? -1 : 1;
  } else {
    return a.data.path.localeCompare(b.data.path);
  }
};

const LsTreeTabContent: React.FC<LsTreeTabProps> = ({ repoPath, commit, refs }) => {
  const [blamePath, setBlamePath] = useState<string | undefined>(undefined);
  const revspec = commit.id;
  const { data: entries } = useTauriSuspenseQuery("get_tree", { repoPath, revspec });
  const sortedEntries = useMemo(() => sortTree(entries, compareEntries), [entries]);
  const lstree = useCallback(
    (direction: Direction) => (
      <LsTreeWithFilter
        orientation={direction === "horiz" ? "portrait" : "landscape"}
        commit={commit}
        entries={sortedEntries}
        blamePath={blamePath}
        onUpdateBlamePath={setBlamePath}
      />
    ),
    [commit, sortedEntries, blamePath]
  );
  return (
    <PersistSplitterPanel
      persistKey="repository/LsTreeTab"
      initialRatio={0.3}
      initialDirection="horiz"
      first={lstree}
      second={
        <div className="flex flex-1 relative">
          {blamePath ? (
            <BlamePanel
              persistKey="repository/LsTreeTab/BlamePanel"
              repoPath={repoPath}
              commit={commit}
              path={blamePath}
              refs={refs}
            />
          ) : (
            <div className="m-auto text-4xl font-bold text-paper">NO FILE SELECTED</div>
          )}
        </div>
      }
      allowDirectionChange
    />
  );
};

export default withRepositoryErrorBoundary(withLoadingSuspense(LsTreeTabContent, "flex flex-1"));
