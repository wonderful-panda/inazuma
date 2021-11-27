import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { CommitDetail } from "./CommitDetail";
import { CommitList } from "./CommitList";
import { WorkingTree } from "./WorkingTree";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "@/store";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { CommitLogItems } from "@/store/repository";
import { useListItemSelector } from "@/hooks/useListItemSelector";
import { useCommitContextMenu } from "@/hooks/useContextMenu";
import { VirtualListMethods } from "../VirtualList";
import { CommandGroup, Cmd } from "../CommandGroup";
import { SHOW_LSTREE } from "@/store/thunk/showLsTree";
import { browseSourceTree } from "@/commands/browseSourceTree";
import { CommitDialog } from "./CommitDialog";
import { CommitCommand } from "@/commands/types";
import { BEGIN_COMMIT } from "@/store/thunk/beginCommit";
import { SHOW_COMMIT_DIFF } from "@/store/thunk/showCommitDiff";
import { SHOW_ALERT } from "@/store/misc";
import { RELOAD_WORKING_TREE } from "@/store/thunk/reloadWorkingTree";
import { FETCH_COMMIT_DETAIL } from "@/store/thunk/fetchCommitDetail";

const beginCommit: CommitCommand = {
  id: "Commit",
  label: "Commit",
  icon: "mdi:content-save",
  hidden: (commit) => commit.id !== "--",
  handler: (dispatch) => dispatch(BEGIN_COMMIT())
};

const CommitLogInner: React.VFC<{
  active: boolean;
  repoPath: string;
  log: CommitLogItems;
}> = ({ active, repoPath, log }) => {
  const dispatch = useDispatch();
  const workingTree = useSelector((state) => state.repository.workingTree);
  const commitDetail = useSelector((state) => state.repository.commitDetail);
  // selected row index, updated immediately
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedIndexRef = useRef(0);
  // selected item id, updated lazily (after data-fetching completed)
  const [loadedId, setLoadedId] = useState("");

  const itemSelector = useListItemSelector(log.commits.length, setSelectedIndex);
  const listRef = useRef<VirtualListMethods>(null);
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
    listRef.current?.scrollToItem(selectedIndex);
  }, [selectedIndex]);

  const actionCommands = useMemo<CommitCommand[]>(
    () => [
      browseSourceTree,
      beginCommit,
      {
        id: "CompareCommits",
        label: "Compare with selected commit",
        icon: "octicon:git-compare-16",
        hidden: (commit) => commit.id === "--",
        handler: (dispatch, commit) => {
          const selectedCommit = log.commits[selectedIndexRef.current];
          if (!selectedCommit || selectedCommit.id === "--" || selectedCommit.id === commit.id) {
            dispatch(SHOW_ALERT({ type: "warning", message: "Base commit is not selected." }));
            return;
          }
          dispatch(SHOW_COMMIT_DIFF(selectedCommit, commit));
        }
      }
    ],
    [log.commits]
  );
  const selectLog = useMemo(
    () =>
      debounce(async (index: number) => {
        if (repoPath && 0 <= index) {
          const sha = log.commits[index].id;
          if (sha === "--") {
            await dispatch(RELOAD_WORKING_TREE());
          } else {
            await dispatch(FETCH_COMMIT_DETAIL(sha));
          }
          if (sha === log.commits[selectedIndexRef.current]?.id) {
            setLoadedId(sha);
          }
        }
      }, 200),
    [repoPath, log.commits, dispatch]
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
  return (
    <>
      <CommandGroup name="CommitLog" enabled={active}>
        <Cmd name="NextCommit" hotkey="Ctrl+N" handler={itemSelector.moveNext} />
        <Cmd name="PrevCommit" hotkey="Ctrl+P" handler={itemSelector.movePrevious} />
        <Cmd name="ShowLsTree" hotkey="Ctrl+L" handler={showLsTreeTab} />
      </CommandGroup>
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
            <div className="flex flex-1 m-2" tabIndex={0} onKeyDown={itemSelector.handleKeyDown}>
              <CommitList
                ref={listRef}
                {...log}
                actionCommands={actionCommands}
                onRowClick={itemSelector.handleRowClick}
                onRowContextMenu={handleContextMenu}
              />
            </div>
          </SelectedIndexProvider>
        }
        second={detail}
      />
      <CommitDialog />
    </>
  );
};

const CommitLog: React.VFC<{ active: boolean }> = ({ active }) => {
  const repoPath = useSelector((state) => state.repository.path);
  const log = useSelector((state) => state.repository.log);
  if (!repoPath || !log) {
    return <></>;
  }
  return <CommitLogInner active={active} repoPath={repoPath} log={log} />;
};

export default CommitLog;
