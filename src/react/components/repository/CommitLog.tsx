import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { CommitDetail } from "./CommitDetail";
import { CommitList } from "./CommitList";
import { WorkingTree } from "./WorkingTree";
import { debounce } from "lodash";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import { useCommitContextMenu } from "@/hooks/useContextMenu";
import { VirtualListMethods } from "../VirtualList";
import { CommandGroup, Cmd } from "../CommandGroup";
import { useBrowseSourceTreeCommand } from "@/commands/browseSourceTree";
import { CommitCommand } from "@/commands/types";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { PinnedCommitContext, SetPinnedCommitContext } from "./CommitListRow";
import { useStateWithRef } from "@/hooks/useStateWithRef";
import { shortHash } from "@/util";
import { CommitLogSideBar } from "./CommitLogSideBar";
import { useCreateBranchCommand } from "@/commands/createBranch";
import { ConnectedRepositoryDialog } from "./ConnectedRepositoryDialog";
import { CommitLogItems, commitDetailAtom, logAtom, repoPathAtom } from "@/state/repository";
import { useAtomValue } from "jotai";
import { useShowWarning } from "@/state/root";
import { useWithRef } from "@/hooks/useWithRef";
import { useBeginCommit, useReloadWorkingTree } from "@/hooks/actions/workingtree";
import { useShowCommitDiff } from "@/hooks/actions/showCommitDiff";
import { workingTreeAtom } from "@/state/repository/workingtree";
import { useShowLsTree } from "@/hooks/actions/showLsTree";
import { useFetchCommitDetail } from "@/hooks/actions/fetchCommitDetail";

const useBeginCommitCommand = () => {
  const beginCommit = useBeginCommit();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "Commit",
      label: "Commit",
      icon: "mdi:content-save",
      hidden: (commit) => commit.id !== "--",
      handler: beginCommit
    }),
    [beginCommit]
  );
};

const useCompareWithParentCommand = () => {
  const [, showCommitDiff] = useWithRef(useShowCommitDiff());
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "CompareCommitWithParent",
      label: "Compare with parent",
      icon: "octicon:git-compare-16",
      hidden: (commit) => commit.id === "--" || commit.parentIds.length === 0,
      handler: (commit) => {
        void showCommitDiff.current("parent", commit);
      }
    }),
    [showCommitDiff]
  );
};

const useCompareWithPinnedCommitCommand = (pinnedCommit: Commit | undefined) => {
  const [, showCommitDiff] = useWithRef(useShowCommitDiff());
  const showWarning = useShowWarning();
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
          showWarning("No commit is pinned");
          return;
        }
        void showCommitDiff.current(pinnedCommit, commit);
      }
    }),
    [pinnedCommit, showCommitDiff, showWarning]
  );
};

const CommitLogInner: React.FC<{
  repoPath: string;
  log: CommitLogItems;
}> = ({ repoPath, log }) => {
  const workingTree = useAtomValue(workingTreeAtom);
  const commitDetail = useAtomValue(commitDetailAtom);
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
  const compareWithParent = useCompareWithParentCommand();
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
  const reloadWorkingTree = useReloadWorkingTree();
  const fetchCommitDetail = useFetchCommitDetail();
  const selectLog = useMemo(
    () =>
      debounce(async (index: number) => {
        if (repoPath && 0 <= index) {
          const sha = log.commits[index].id;
          await (sha === "--" ? reloadWorkingTree() : fetchCommitDetail(sha));
          if (sha === log.commits[selectedIndexRef.current]?.id) {
            setLoadedId(sha);
          }
        }
      }, 200),
    [repoPath, log.commits, selectedIndexRef, reloadWorkingTree, fetchCommitDetail]
  );
  const currentRefs = useMemo(() => {
    if (!loadedId) {
      return [];
    } else {
      return log.refs.refsById[loadedId] || [];
    }
  }, [loadedId, log]);

  useEffect(() => {
    void selectLog(selectedIndex);
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
  const showLsTree = useShowLsTree();
  const showLsTreeTab = useCallback(
    () => loadedId !== "--" && commitDetail && showLsTree(commitDetail),
    [loadedId, commitDetail, showLsTree]
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
      <CommandGroup name="CommitLog">
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
                  <KeyDownTrapper className="mx-3 my-2" onKeyDown={handleKeyDown}>
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

const CommitLog: React.FC = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const log = useAtomValue(logAtom);
  if (!repoPath || !log) {
    return <></>;
  }
  return <CommitLogInner repoPath={repoPath} log={log} />;
};

export default CommitLog;
