import { useDispatch } from "@/store";
import { SHOW_ERROR } from "@/store/misc";
import { filterTreeItems, sortTreeInplace } from "@/tree";
import { serializeError } from "@/util";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTreeModel, TreeItemVM } from "@/hooks/useTreeModel";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { Loading } from "../Loading";
import { LsTree } from "./LsTree";
import { IconButton, TextField } from "@mui/material";
import { Icon } from "../Icon";
import { debounce } from "lodash";
import { useTreeItemSelector } from "@/hooks/useTreeItemSelector";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { BlamePanel } from "./BlamePanel";
import { dispatchBrowser } from "@/dispatchBrowser";
import { KeyDownTrapper } from "../KeyDownTrapper";

export interface LsTreeTabProps {
  repoPath: string;
  commit: Commit;
  refs: Refs | undefined;
}

const LsTreeWithFilter: React.VFC<{
  entries: readonly LstreeEntry[];
  blamePath: string | undefined;
  onUpdateBlamePath: (value: string | undefined) => void;
}> = ({ entries, blamePath, onUpdateBlamePath }) => {
  const [filterText, setFilterText] = useState("");
  const onFilterTextChange = useMemo(
    () =>
      debounce((e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(e.target.value);
      }, 500),
    []
  );
  const filteredEntries = useMemo(() => {
    if (!filterText) {
      return entries;
    }
    return filterTreeItems(entries, (data) => data.path.indexOf(filterText) >= 0);
  }, [entries, filterText]);

  const [state, dispatch] = useTreeModel<LstreeEntryData>();
  const { handleKeyDown, handleRowClick } = useTreeItemSelector(state, dispatch);

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
    (data: LstreeEntryData) => (data.path === blamePath ? "text-primary font-bold" : undefined),
    [blamePath]
  );

  const handleRowDoubleClick = useCallback(
    (event: React.MouseEvent, _index: number, { item }: TreeItemVM<LstreeEntryData>) => {
      if (event.button === 0 && item.data.type === "blob") {
        onUpdateBlamePath(item.data.path);
      }
    },
    [onUpdateBlamePath]
  );

  const selectedData = useRef<LstreeEntryData | undefined>(undefined);
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
  return (
    <div className="flex-col-nowrap flex-1 m-1">
      <div className="flex-row-nowrap items-end mb-4 mr-2">
        <Icon icon="mdi:filter" className="text-2xl m-1" />
        <TextField
          label="Filter by path"
          className="flex-1 whitespace-nowrap overflow-hidden"
          variant="standard"
          onChange={onFilterTextChange}
        />
        <IconButton size="small" onClick={expandAll} title="Expand all">
          <Icon icon="mdi:chevron-down" className="text-2xl" />
        </IconButton>
        <IconButton size="small" onClick={collapseAll} title="Collapse all">
          <Icon icon="mdi:chevron-up" className="text-2xl" />
        </IconButton>
      </div>
      <SelectedIndexProvider value={state.selectedIndex}>
        <KeyDownTrapper className="m-1 p-1 border border-paper" onKeyDown={handleKeyDownWithEnter}>
          <LsTree
            treeModelState={state}
            treeModelDispatch={dispatch}
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            getRowClass={getRowClass}
          />
        </KeyDownTrapper>
      </SelectedIndexProvider>
    </div>
  );
};

const LsTreeTab: React.VFC<LsTreeTabProps> = ({ repoPath, commit, refs }) => {
  const [entries, setEntries] = useState<LstreeEntry[]>([]);
  const [blame, setBlame] = useState<{ blame: Blame; path: string } | undefined>(undefined);
  const [blameLoading, setBlameLoading] = useState(false);
  const dispatch = useDispatch();
  const sha = commit.id;
  useEffect(() => {
    dispatchBrowser("getTree", { repoPath, sha })
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
      .catch((e) => {
        dispatch(SHOW_ERROR({ error: serializeError(e) }));
      });
  }, [repoPath, sha, dispatch]);
  const onUpdateBlamePath = useCallback(
    async (path: string | undefined) => {
      if (path === blame?.path) {
        return;
      }
      if (!path) {
        setBlame(undefined);
        return;
      }
      setBlameLoading(true);
      try {
        const blame = await dispatchBrowser("getBlame", { repoPath, relPath: path, sha });
        setBlame({ blame, path });
      } catch (e) {
        dispatch(SHOW_ERROR({ error: serializeError(e) }));
      } finally {
        setBlameLoading(false);
      }
    },
    [dispatch, repoPath, sha, blame?.path]
  );

  return !entries ? (
    <Loading open />
  ) : (
    <PersistSplitterPanel
      persistKey="repository/LsTreeTab"
      initialRatio={0.3}
      initialDirection="horiz"
      first={
        <LsTreeWithFilter
          entries={entries}
          blamePath={blame?.path}
          onUpdateBlamePath={onUpdateBlamePath}
        />
      }
      second={
        <div className="flex flex-1 relative">
          {blame && (
            <BlamePanel
              persistKey="repository/LsTreeTab/BlamePanel"
              blame={blame.blame}
              path={blame.path}
              sha={sha}
              refs={refs}
            />
          )}
          {blameLoading && <Loading open />}
        </div>
      }
      allowDirectionChange
    />
  );
};

export default LsTreeTab;
