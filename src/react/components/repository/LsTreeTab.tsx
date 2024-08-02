import { filterTreeItems, sortTreeInplace } from "@/tree";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTreeModel, TreeItemVM } from "@/hooks/useTreeModel";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { Loading } from "../Loading";
import { LsTree } from "./LsTree";
import { IconButton } from "@mui/material";
import { Icon } from "../Icon";
import { useTreeIndexChanger } from "@/hooks/useTreeIndexChanger";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { BlamePanel } from "./BlamePanel";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useBlame } from "@/hooks/useBlame";
import PathFilter from "./PathFilter";
import { useReportError } from "@/state/root";
import { CommitAttributes } from "./CommitAttributes";
import classNames from "classnames";
import { FlexCard } from "../FlexCard";

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
    return filterTreeItems(entries, (data) => data.path.indexOf(filterText) >= 0);
  }, [entries, filterText]);

  const [state, dispatch] = useTreeModel<LstreeData>();
  const { handleKeyDown, handleRowMouseDown } = useTreeIndexChanger(state, dispatch);

  useEffect(() => {
    dispatch({ type: "reset", payload: { items: filteredEntries } });
  }, [filteredEntries, dispatch]);

  const expandAll = useCallback(() => {
    dispatch({ type: "expandAll" });
  }, [dispatch]);

  const collapseAll = useCallback(() => {
    dispatch({ type: "collapseAll" });
  }, [dispatch]);

  const getRowClass = useCallback(
    (data: LstreeData) => (data.path === blamePath ? "text-primary font-bold" : undefined),
    [blamePath]
  );

  const handleRowDoubleClick = useCallback(
    (event: React.MouseEvent, _index: number, { item }: TreeItemVM<LstreeData>) => {
      if (event.button === 0 && item.data.type === "blob") {
        onUpdateBlamePath(item.data.path);
      }
    },
    [onUpdateBlamePath]
  );

  const selectedData = useRef<LstreeData | undefined>(undefined);
  useLayoutEffect(() => {
    selectedData.current = state.selectedItem?.item.data;
  }, [state.selectedItem]);
  const handleKeyDownWithEnter = useCallback(
    (event: React.KeyboardEvent) => {
      if (handleKeyDown(event)) {
        return;
      }
      // get selected data via RefObject to avoid recomputation after selected index changed
      if (event.key === "Enter") {
        if (selectedData.current?.type === "blob") {
          onUpdateBlamePath(selectedData.current.path);
        }
      }
    },
    [onUpdateBlamePath, handleKeyDown]
  );
  const content = (
    <div
      className={classNames(
        "flex-1 m-1",
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
        <SelectedIndexProvider value={state.selectedIndex}>
          <KeyDownTrapper className="p-1 border border-paper" onKeyDown={handleKeyDownWithEnter}>
            <LsTree
              treeModelState={state}
              treeModelDispatch={dispatch}
              onRowMouseDown={handleRowMouseDown}
              onRowDoubleClick={handleRowDoubleClick}
              getRowClass={getRowClass}
            />
          </KeyDownTrapper>
        </SelectedIndexProvider>
      </div>
    </div>
  );
  return (
    <div className="flex flex-1 p-2">
      <FlexCard content={content} />
    </div>
  );
};

const LsTreeTab: React.FC<LsTreeTabProps> = ({ repoPath, commit, refs }) => {
  const [entries, setEntries] = useState<LstreeEntry[]>([]);
  const [blamePath, setBlamePath] = useState<string | undefined>(undefined);
  const revspec = commit.id;
  const blame = useBlame(repoPath, blamePath, revspec);
  const reportError = useReportError();
  const lstree = useCallback(
    (direction: Direction) => (
      <LsTreeWithFilter
        orientation={direction === "horiz" ? "portrait" : "landscape"}
        commit={commit}
        entries={entries}
        blamePath={blamePath}
        onUpdateBlamePath={setBlamePath}
      />
    ),
    [commit, entries, blamePath, setBlamePath]
  );
  useEffect(() => {
    invokeTauriCommand("get_tree", { repoPath, revspec })
      .then((entries) => {
        sortTreeInplace(entries, (a, b) => {
          if (a.data.type !== b.data.type) {
            return a.data.type === "tree" ? -1 : 1;
          } else {
            return a.data.path.localeCompare(b.data.path);
          }
        });
        setEntries(entries);
      })
      .catch((error) => {
        reportError({ error });
      });
  }, [repoPath, revspec, reportError]);
  return !entries ? (
    <Loading open />
  ) : (
    <PersistSplitterPanel
      persistKey="repository/LsTreeTab"
      initialRatio={0.3}
      initialDirection="horiz"
      first={lstree}
      second={
        <div className="flex flex-1 relative">
          {blame?.blame && (
            <BlamePanel
              persistKey="repository/LsTreeTab/BlamePanel"
              blame={blame.blame}
              commit={commit}
              path={blame.path}
              refs={refs}
            />
          )}
          {blame && !blame.blame && <Loading open />}
        </div>
      }
      allowDirectionChange
    />
  );
};

export default LsTreeTab;
