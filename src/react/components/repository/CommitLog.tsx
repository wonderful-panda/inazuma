import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SplitterPanel from "../PersistSplitterPanel";
import CommitDetail from "./CommitDetail";
import CommitList from "./CommitList";
import WorkingTree from "./WorkingTree";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "@/store";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { CommitLogItems } from "@/store/repository";
import useListItemSelector from "@/hooks/useListItemSelector";
import { useCommitContextMenu } from "@/hooks/useContextMenu";
import { VirtualListMethods } from "../VirtualList";
import { CommandGroup, Cmd } from "../CommandGroup";
import { SHOW_LSTREE } from "@/store/thunk/showLsTree";
import { SHOW_LOG_DETAIL } from "@/store/thunk/showLogDetail";
import { browseSourceTree } from "@/commands/browseSourceTree";
import CommitDialog from "./CommitDialog";
import { CommitCommand } from "@/commands/types";
import { BEGIN_COMMIT } from "@/store/thunk/beginCommit";
import { SHOW_COMMIT_DIFF } from "@/store/thunk/showCommitDiff";

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
  logDetail: LogDetail | undefined;
}> = ({ active, repoPath, log, logDetail }) => {
  const dispatch = useDispatch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemSelector = useListItemSelector(log.commits.length, setSelectedIndex);
  const listRef = useRef<VirtualListMethods>(null);
  const actionCommands = useMemo<CommitCommand[]>(
    () => [
      browseSourceTree,
      beginCommit,
      {
        id: "CompareCommits",
        label: "Compare with selected commit",
        icon: "octicon:git-compare-16",
        hidden: (commit) => commit.id === "--",
        disabled: (commit) => {
          const selectedCommit = log.commits[selectedIndex];
          if (!selectedCommit || selectedCommit.id === "--" || selectedCommit.id === commit.id) {
            return true;
          }
          return false;
        },
        handler: (dispatch, commit) => {
          const selectedCommit = log.commits[selectedIndex];
          dispatch(SHOW_COMMIT_DIFF(selectedCommit, commit));
        }
      }
    ],
    [log.commits, selectedIndex]
  );
  const selectLog = useMemo(
    () =>
      debounce(async (index: number) => {
        if (repoPath && 0 <= index) {
          const sha = log.commits[index].id;
          dispatch(SHOW_LOG_DETAIL(sha));
        }
      }, 200),
    [repoPath, log.commits, dispatch]
  );
  const currentRefs = useMemo(() => {
    if (!logDetail) {
      return [];
    } else {
      return log.refs.refsById[logDetail.id] || [];
    }
  }, [logDetail, log]);

  useEffect(() => {
    selectLog(selectedIndex);
  }, [selectedIndex, selectLog]);

  useEffect(() => listRef.current?.scrollToItem(selectedIndex), [selectedIndex]);

  const detail = useCallback(
    (direction: Direction) => {
      const orientation = direction === "horiz" ? "portrait" : "landscape";
      return (
        <div className="flex flex-1 overflow-hidden m-2">
          {logDetail === undefined || logDetail.type === "commit" ? (
            <CommitDetail commit={logDetail} refs={currentRefs} orientation={orientation} />
          ) : (
            <WorkingTree stat={logDetail} orientation={orientation} />
          )}
        </div>
      );
    },
    [currentRefs, logDetail]
  );
  const showLsTreeTab = useCallback(
    () => logDetail?.type === "commit" && dispatch(SHOW_LSTREE(logDetail)),
    [logDetail, dispatch]
  );
  const handleContextMenu = useCommitContextMenu();
  return (
    <>
      <CommandGroup name="CommitLog" enabled={active}>
        <Cmd name="NextCommit" hotkey="Ctrl+N" handler={itemSelector.moveNext} />
        <Cmd name="PrevCommit" hotkey="Ctrl+P" handler={itemSelector.movePrevious} />
        <Cmd name="ShowLsTree" hotkey="Ctrl+L" handler={showLsTreeTab} />
      </CommandGroup>
      <SplitterPanel
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
  const logDetail = useSelector((state) => state.repository.selectedLogDetail);
  if (!repoPath || !log) {
    return <></>;
  }
  return <CommitLogInner active={active} repoPath={repoPath} log={log} logDetail={logDetail} />;
};

export default CommitLog;
