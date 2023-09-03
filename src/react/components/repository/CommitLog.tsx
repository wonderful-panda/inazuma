import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { CommitDetail } from "./CommitDetail";
import { CommitList } from "./CommitList";
import { WorkingTree } from "./WorkingTree";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "@/store";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { CommitLogItems } from "@/store/repository";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import { useCommitContextMenu } from "@/hooks/useContextMenu";
import { VirtualListMethods } from "../VirtualList";
import { CommandGroup, Cmd } from "../CommandGroup";
import { SHOW_LSTREE } from "@/store/thunk/showLsTree";
import { useBrowseSourceTreeCommand } from "@/commands/browseSourceTree";
import { CommitCommand } from "@/commands/types";
import { BEGIN_COMMIT } from "@/store/thunk/beginCommit";
import { SHOW_COMMIT_DIFF } from "@/store/thunk/showCommitDiff";
import { SHOW_WARNING } from "@/store/misc";
import { RELOAD_WORKING_TREE } from "@/store/thunk/reloadWorkingTree";
import { FETCH_COMMIT_DETAIL } from "@/store/thunk/fetchCommitDetail";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { PinnedCommitContext, SetPinnedCommitContext } from "./CommitListRow";
import { useStateWithRef } from "@/hooks/useStateWithRef";
import { shortHash } from "@/util";
import { CommitLogSideBar } from "./CommitLogSideBar";
import { useCreateBranchCommand } from "@/commands/createBranch";
import { ConnectedRepositoryDialog } from "./ConnectedRepositoryDialog";

const useBeginCommitCommand = () => {
  const dispatch = useDispatch();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "Commit",
      label: "Commit",
      icon: "mdi:content-save",
      hidden: (commit) => commit.id !== "--",
      handler: () => dispatch(BEGIN_COMMIT())
    }),
    [dispatch]
  );
};

const useCompareWithParentCommand = (commits: readonly Commit[]) => {
  const dispatch = useDispatch();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "CompareCommitWithParent",
      label: "Compare with parent",
      icon: "octicon:git-compare-16",
      hidden: (commit) => commit.id === "--" || commit.parentIds.length === 0,
      handler: (commit) => {
        const baseCommit = commits.find((c) => c.id === commit.parentIds[0]);
        if (!baseCommit) {
          dispatch(SHOW_WARNING("Parent commit is not found"));
          return;
        }
        dispatch(SHOW_COMMIT_DIFF(baseCommit, commit));
      }
    }),
    [dispatch, commits]
  );
};

const useCompareWithPinnedCommitCommand = (pinnedCommit: Commit | undefined) => {
  const dispatch = useDispatch();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "CompareCommitWithPinnedCommit",
      label: `Compare with Compare-BASE commit (${
        pinnedCommit ? shortHash(pinnedCommit.id) : "NOT SELECTED"
      })`,
      icon: "mdi:map-marker-distance",
      hidden: (commit) => commit.id === "--",
      disabled: (commit) => !pinnedCommit || pinnedCommit.id === commit.id,
      handler: (commit) => {
        if (!pinnedCommit) {
          return;
        }
        dispatch(SHOW_COMMIT_DIFF(pinnedCommit, commit));
      }
    }),
    [dispatch, pinnedCommit]
  );
};

const CommitLogInner: React.FC<{
  active: boolean;
  repoPath: string;
  log: CommitLogItems;
}> = ({ active, repoPath, log }) => {
  const dispatch = useDispatch();
  const workingTree = useSelector((state) => state.repository.workingTree);
  const commitDetail = useSelector((state) => state.repository.commitDetail);
  // selected row index, updated immediately
  const [selectedIndex, setSelectedIndex, selectedIndexRef] = useStateWithRef(0);
  // selected item id, updated lazily (after data-fetching completed)
  const [loadedId, setLoadedId] = useState("");

  const [pinnedCommit, setPinnedCommit] = useState<Commit | undefined>(undefined);

  const { moveNext, movePrevious, handleKeyDown, handleRowMouseDown } = useListIndexChanger(
    log.commits.length,
    setSelectedIndex
  );
  const listRef = useRef<VirtualListMethods>(null);
  useEffect(() => {
    listRef.current?.scrollToItem(selectedIndex);
  }, [selectedIndex]);

  const createBranch = useCreateBranchCommand();
  const browseSourceTree = useBrowseSourceTreeCommand();
  const beginCommit = useBeginCommitCommand();
  const compareWithParent = useCompareWithParentCommand(log.commits);
  const compareWithPinnedCommit = useCompareWithPinnedCommitCommand(pinnedCommit);
  const actionCommands = useMemo<CommitCommand[]>(() => {
    return [
      createBranch,
      browseSourceTree,
      beginCommit,
      compareWithParent,
      compareWithPinnedCommit
    ];
  }, [createBranch, browseSourceTree, beginCommit, compareWithParent, compareWithPinnedCommit]);
  const selectLog = useMemo(
    () =>
      debounce(async (index: number) => {
        if (repoPath && 0 <= index) {
          const sha = log.commits[index].id;
          await dispatch(sha === "--" ? RELOAD_WORKING_TREE() : FETCH_COMMIT_DETAIL(sha));
          if (sha === log.commits[selectedIndexRef.current]?.id) {
            setLoadedId(sha);
          }
        }
      }, 200),
    [repoPath, log.commits, dispatch, selectedIndexRef]
  );
  const currentRefs = useMemo(() => {
    if (!loadedId) {
      return [];
    } else {
      return log.refs.refsById[loadedId] || [];
    }
  }, [loadedId, log]);

  useEffect(() => {
    selectLog(selectedIndex);
  }, [selectedIndex, selectLog]);

  const detail = useCallback(
    (direction: Direction) => {
      const orientation = direction === "horiz" ? "portrait" : "landscape";
      return (
        <div className="flex flex-1 overflow-hidden m-2">
          {loadedId === "--" ? (
            <WorkingTree stat={workingTree} orientation={orientation} />
          ) : (
            <CommitDetail commit={commitDetail} refs={currentRefs} orientation={orientation} />
          )}
        </div>
      );
    },
    [currentRefs, workingTree, commitDetail, loadedId]
  );
  const showLsTreeTab = useCallback(
    () => loadedId !== "--" && commitDetail && dispatch(SHOW_LSTREE(commitDetail)),
    [loadedId, commitDetail, dispatch]
  );
  const handleContextMenu = useCommitContextMenu();

  const handleSideBarItemClick = useCallback(
    (r: Ref) => {
      const index = log.commits.findIndex((c) => c.id === r.id);
      if (0 <= index) {
        setSelectedIndex(index);
        listRef.current?.scrollToItem(index);
      }
    },
    [log.commits, setSelectedIndex]
  );
  return (
    <>
      <CommandGroup name="CommitLog" enabled={active}>
        <Cmd name="NextCommit" hotkey="Ctrl+N" handler={moveNext} />
        <Cmd name="PrevCommit" hotkey="Ctrl+P" handler={movePrevious} />
        <Cmd name="ShowLsTree" hotkey="Ctrl+L" handler={showLsTreeTab} />
      </CommandGroup>
      <div className="flex-row-nowrap flex-1">
        <CommitLogSideBar refs={log.refs} onItemClick={handleSideBarItemClick} />
        <PersistSplitterPanel
          persistKey="repository/CommitLog"
          initialDirection="horiz"
          initialRatio={0.7}
          splitterThickness={5}
          allowDirectionChange
          firstPanelMinSize="20%"
          secondPanelMinSize="20%"
          first={
            <SelectedIndexProvider value={selectedIndex}>
              <PinnedCommitContext.Provider value={pinnedCommit}>
                <SetPinnedCommitContext.Provider value={setPinnedCommit}>
                  <KeyDownTrapper className="m-2" onKeyDown={handleKeyDown}>
                    <CommitList
                      ref={listRef}
                      {...log}
                      actionCommands={actionCommands}
                      onRowMouseDown={handleRowMouseDown}
                      onRowContextMenu={handleContextMenu}
                    />
                  </KeyDownTrapper>
                </SetPinnedCommitContext.Provider>
              </PinnedCommitContext.Provider>
            </SelectedIndexProvider>
          }
          second={detail}
        />
        <ConnectedRepositoryDialog />
      </div>
    </>
  );
};

const CommitLog: React.FC<{ active: boolean }> = ({ active }) => {
  const repoPath = useSelector((state) => state.repository.path);
  const log = useSelector((state) => state.repository.log);
  if (!repoPath || !log) {
    return <></>;
  }
  return <CommitLogInner active={active} repoPath={repoPath} log={log} />;
};

export default CommitLog;
