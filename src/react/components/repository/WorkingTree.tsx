import { stage, unstage } from "@/commands/staging";
import { diffStaged, diffUnstaged } from "@/commands/diff";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import useListItemSelector from "@/hooks/useListItemSelector";
import { useFileContextMenu } from "@/hooks/useContextMenu";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import FlexCard from "../FlexCard";
import SplitterPanel from "../PersistSplitterPanel";
import { VirtualListMethods } from "../VirtualList";
import FileList, { useFileListRowEventHandler } from "./FileList";
import { Button } from "@material-ui/core";
import { useDispatch } from "@/store";
import { STAGE, UNSTAGE } from "@/store/thunk/staging";
import { BEGIN_COMMIT } from "@/store/thunk/beginCommit";

export interface WorkingTreeProps {
  stat: WorkingTreeStat;
  orientation: Orientation;
}

type Active = "unstaged" | "staged" | "none";
interface Selection {
  unstagedIndex: number;
  stagedIndex: number;
  active: Active;
}

const getIndices = (s: Selection): [number, number] => {
  switch (s.active) {
    case "unstaged":
      return [s.unstagedIndex, -1];
    case "staged":
      return [-1, s.stagedIndex];
    default:
      return [-1, -1];
  }
};

const getActive = (
  unstagedIndex: number,
  stagedIndex: number,
  prior: "unstaged" | "staged"
): Active => {
  if (unstagedIndex < 0) {
    return stagedIndex < 0 ? "none" : "staged";
  } else {
    return stagedIndex < 0 ? "unstaged" : prior;
  }
};

const unstagedActionCommands = [diffUnstaged, stage];
const stagedActionCommands = [diffStaged, unstage];

const WorkingTree: React.VFC<WorkingTreeProps> = ({ stat, orientation }) => {
  const dispatch = useDispatch();
  const handleContextMenu = useFileContextMenu(stat);
  const unstagedListRef = useRef<VirtualListMethods>(null);
  const stagedListRef = useRef<VirtualListMethods>(null);
  const [selection, setSelection] = useState<Selection>({
    unstagedIndex: 0,
    stagedIndex: 0,
    active: "unstaged"
  });
  const [unstagedIndex, stagedIndex] = getIndices(selection);
  const setUnstagedIndex = useCallback((value: React.SetStateAction<number>) => {
    setSelection((cur) => {
      const newValue = typeof value === "function" ? value(getIndices(cur)[0]) : value;
      return {
        unstagedIndex: newValue,
        stagedIndex: cur.stagedIndex,
        active: getActive(newValue, cur.stagedIndex, "unstaged")
      };
    });
  }, []);
  const setStagedIndex = useCallback((value: React.SetStateAction<number>) => {
    setSelection((cur) => {
      const newValue = typeof value === "function" ? value(getIndices(cur)[1]) : value;
      return {
        unstagedIndex: cur.unstagedIndex,
        stagedIndex: newValue,
        active: getActive(cur.unstagedIndex, newValue, "staged")
      };
    });
  }, []);
  useEffect(() => unstagedListRef.current?.scrollToItem(unstagedIndex), [unstagedIndex]);
  useEffect(() => stagedListRef.current?.scrollToItem(stagedIndex), [stagedIndex]);

  const unstagedFiles = useMemo<FileEntry[]>(() => {
    const ret = [
      ...stat.unstagedFiles.map((f) => ({ ...f, unstaged: true })),
      ...stat.untrackedFiles.map((f) => ({ path: f, statusCode: "?", unstaged: true }))
    ];
    ret.sort((a, b) => a.path.localeCompare(b.path));
    return ret;
  }, [stat]);

  const unstagedFocused = useCallback(() => {
    if (0 < unstagedFiles.length) {
      setSelection((cur) => ({
        unstagedIndex: Math.max(cur.unstagedIndex, 0),
        stagedIndex: cur.stagedIndex,
        active: "unstaged"
      }));
    }
  }, [unstagedFiles.length]);
  const stagedFocused = useCallback(() => {
    setSelection((cur) => ({
      unstagedIndex: cur.unstagedIndex,
      stagedIndex: Math.max(cur.stagedIndex, 0),
      active: "staged"
    }));
  }, []);
  const unstagedSelector = useListItemSelector(unstagedFiles.length, setUnstagedIndex);
  const stagedSelector = useListItemSelector(stat.stagedFiles.length, setStagedIndex);
  const handleUnstagedRowDoubleClick = useFileListRowEventHandler(diffUnstaged, stat);
  const handleStagedRowDoubleClick = useFileListRowEventHandler(diffStaged, stat);
  const callbacks = useMemo(
    () => ({
      stageAll: () => dispatch(STAGE("**/*")),
      unstageAll: () => dispatch(UNSTAGE("**/*")),
      commit: () => dispatch(BEGIN_COMMIT())
    }),
    [dispatch]
  );
  return (
    <SplitterPanel
      persistKey="repository/WorkingTree"
      initialRatio={0.5}
      initialDirection={orientation === "portrait" ? "vert" : "horiz"}
      allowDirectionChange={false}
      first={
        <FlexCard
          title="Unstaged changes"
          content={
            <SelectedIndexProvider value={unstagedIndex}>
              <div
                className="flex flex-1 m-1 p-1"
                onFocus={unstagedFocused}
                tabIndex={0}
                onKeyDown={unstagedSelector.handleKeyDown}
              >
                <FileList
                  ref={unstagedListRef}
                  commit={stat}
                  files={unstagedFiles}
                  actionCommands={unstagedActionCommands}
                  onRowClick={unstagedSelector.handleRowClick}
                  onRowDoubleClick={handleUnstagedRowDoubleClick}
                  onRowContextMenu={handleContextMenu}
                />
              </div>
            </SelectedIndexProvider>
          }
          actions={
            <>
              <Button disabled={unstagedFiles.length === 0} onClick={callbacks.stageAll}>
                Stage all files
              </Button>
            </>
          }
        />
      }
      second={
        <SelectedIndexProvider value={stagedIndex}>
          <FlexCard
            title="Staged changes"
            content={
              <div
                className="flex flex-1 m-1 p-1"
                onFocus={stagedFocused}
                tabIndex={0}
                onKeyDown={stagedSelector.handleKeyDown}
              >
                <FileList
                  ref={stagedListRef}
                  commit={stat}
                  files={stat.stagedFiles}
                  actionCommands={stagedActionCommands}
                  onRowClick={stagedSelector.handleRowClick}
                  onRowDoubleClick={handleStagedRowDoubleClick}
                  onRowContextMenu={handleContextMenu}
                />
              </div>
            }
            actions={
              <>
                <Button disabled={stat.stagedFiles.length === 0} onClick={callbacks.unstageAll}>
                  Unstage all files
                </Button>
                <Button disabled={stat.stagedFiles.length === 0} onClick={callbacks.commit}>
                  Commit
                </Button>
              </>
            }
          />
        </SelectedIndexProvider>
      }
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};

export default memo(WorkingTree);
