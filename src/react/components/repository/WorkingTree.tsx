import { diffStaged, diffUnstaged } from "@/commands/diff";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import useListItemSelector from "@/hooks/useListItemSelector";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import FlexCard from "../FlexCard";
import SplitterPanel from "../PersistSplitterPanel";
import { VirtualListMethods } from "../VirtualList";
import FileList, { useFileListRowEventHandler } from "./FileList";

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

const WorkingTree: React.VFC<WorkingTreeProps> = ({ stat, orientation }) => {
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

  const unstagedFiles = useMemo(() => {
    const ret = [
      ...stat.unstagedFiles,
      ...stat.untrackedFiles.map((f) => ({ path: f, statusCode: "?" }))
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
                  files={unstagedFiles}
                  onRowClick={unstagedSelector.handleRowClick}
                  onRowDoubleClick={handleUnstagedRowDoubleClick}
                />
              </div>
            </SelectedIndexProvider>
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
                  files={stat.stagedFiles}
                  onRowClick={stagedSelector.handleRowClick}
                  onRowDoubleClick={handleStagedRowDoubleClick}
                />
              </div>
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
