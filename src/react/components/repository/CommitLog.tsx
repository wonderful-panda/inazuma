import { useAtomValue } from "jotai";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBrowseSourceTreeCommand } from "@/commands/browseSourceTree";
import { useCreateBranchCommand } from "@/commands/createBranch";
import { useResetCommand } from "@/commands/reset";
import type { CommitCommand } from "@/commands/types";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { getDragData, isDragDataPresent } from "@/dragdrop";
import { useBeginMoveBranch } from "@/hooks/actions/branch";
import { useFetchCommitDetail } from "@/hooks/actions/fetchCommitDetail";
import { useBeginReset } from "@/hooks/actions/reset";
import { useShowCommitDiff } from "@/hooks/actions/showCommitDiff";
import { useShowLsTree } from "@/hooks/actions/showLsTree";
import { useBeginCommit, useReloadWorkingTree } from "@/hooks/actions/workingtree";
import { useCommitContextMenu } from "@/hooks/useContextMenu";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import { useStateWithRef } from "@/hooks/useStateWithRef";
import { useWithRef } from "@/hooks/useWithRef";
import { type CommitLogItems, commitDetailAtom, logAtom, repoPathAtom } from "@/state/repository";
import { workingTreeAtom } from "@/state/repository/workingtree";
import { Cmd, CommandGroup } from "../CommandGroup";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import type { VirtualListMethods } from "../VirtualList";
import { CommitDetail } from "./CommitDetail";
import { CommitList } from "./CommitList";
import { CommitLogSideBar } from "./CommitLogSideBar";
import { WorkingTree } from "./WorkingTree";

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
    []
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

  const { moveNext, movePrevious, handleKeyDown, handleRowMouseDown } = useListIndexChanger(
    log.commits.length,
    setSelectedIndex
  );
  const listRef = useRef<VirtualListMethods>(null);
  useEffect(() => {
    listRef.current?.scrollToItem(selectedIndex);
  }, [selectedIndex]);

  useEffect(() => {
    // workaround: scrollToItem() does not work as expected on mounted. (maybe conflicts with resizing)
    // So, do it after all on-mounted efects completed.
    setTimeout(() => listRef.current?.scrollToItem(selectedIndexRef.current), 0);
  }, []);

  const reset = useResetCommand();
  const createBranch = useCreateBranchCommand();
  const browseSourceTree = useBrowseSourceTreeCommand();
  const beginReset = useBeginReset();
  const beginMoveBranch = useBeginMoveBranch();
  const beginCommit = useBeginCommitCommand();
  const compareWithParent = useCompareWithParentCommand();
  const actionCommands = useMemo<CommitCommand[]>(() => {
    return [createBranch, reset, browseSourceTree, beginCommit, compareWithParent];
  }, [createBranch, reset, browseSourceTree, beginCommit, compareWithParent]);
  const reloadWorkingTree = useReloadWorkingTree();
  const fetchCommitDetail = useFetchCommitDetail();
  const selectLog = useMemo(
    () =>
      debounce(async (index: number) => {
        if (repoPath && 0 <= index && index < log.commits.length) {
          const sha = log.commits[index]!.id;
          await (sha === "--" ? reloadWorkingTree() : fetchCommitDetail(sha));
          if (sha === log.commits[selectedIndexRef.current]?.id) {
            setLoadedId(sha);
          }
        }
      }, 200),
    [repoPath, log.commits, reloadWorkingTree, fetchCommitDetail]
  );
  const currentRefs = useMemo(() => {
    if (!loadedId) {
      return [];
    } else {
      return log.refs.refsById[loadedId];
    }
  }, [loadedId, log]);

  useEffect(() => {
    void selectLog(selectedIndex);
  }, [selectedIndex, selectLog]);

  // biome-ignore lint/correctness/useExhaustiveDependencies(repoPath): repoPath changes should trigger scroll to selected item
  useEffect(() => {
    setTimeout(() => {
      listRef.current?.scrollToItem(selectedIndexRef.current);
    }, 0);
  }, [repoPath]);

  const detail = useCallback(
    (direction: Direction) => {
      const orientation = direction === "horiz" ? "portrait" : "landscape";
      return (
        <div className="flex flex-1 overflow-hidden m-2">
          {loadedId === "--" ? (
            <WorkingTree stat={workingTree} orientation={orientation} />
          ) : (
            <CommitDetail
              commit={commitDetail}
              key={commitDetail?.id || "empty"}
              refs={currentRefs}
              orientation={orientation}
            />
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
  const handleRowDragOver = useCallback((e: React.DragEvent, _: number, item: Commit) => {
    if (item.id !== "--" && isDragDataPresent(e, "git/branch")) {
      e.dataTransfer.dropEffect = "move";
      e.preventDefault();
    }
  }, []);

  const handleRowDrop = useCallback(
    (e: React.DragEvent, _: number, item: Commit) => {
      if (item.id === "--") {
        return;
      }
      const data = getDragData(e, "git/branch");
      if (!data) {
        return;
      }
      if (data.current) {
        void beginReset(item);
      } else {
        void beginMoveBranch(data.name, item);
      }
      e.preventDefault();
    },
    [beginReset, beginMoveBranch]
  );

  const handleSideBarItemClick = useCallback(
    (r: Ref) => {
      const index = log.commits.findIndex((c) => c.id === r.id);
      if (0 <= index) {
        setSelectedIndex(index);
        listRef.current?.scrollToItem(index);
      }
    },
    [log.commits]
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
              <KeyDownTrapper className="mx-3 my-2" onKeyDown={handleKeyDown}>
                <CommitList
                  ref={listRef}
                  {...log}
                  actionCommands={actionCommands}
                  onRowMouseDown={handleRowMouseDown}
                  onRowContextMenu={handleContextMenu}
                  onRowDragEnter={handleRowDragOver}
                  onRowDragOver={handleRowDragOver}
                  onRowDrop={handleRowDrop}
                />
              </KeyDownTrapper>
            </SelectedIndexProvider>
          }
          second={detail}
        />
      </div>
    </>
  );
};

const CommitLog: React.FC = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const log = useAtomValue(logAtom);
  if (!repoPath || !log) {
    return null;
  }
  return <CommitLogInner repoPath={repoPath} log={log} />;
};

export default CommitLog;
