import { CustomSelectedIndexProvider } from "@/context/SelectedIndexContext";
import { usePersistState } from "@/hooks/usePersistState";
import { memo, useCallback, useMemo, useState } from "react";
import FlexCard from "../FlexCard";
import SplitterPanel from "../SplitterPanel";
import FileList from "./FileList";

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
  const [splitterRatio, setSplitterRatio] = usePersistState(
    "repository/WorkingTree/splitter.ratio",
    0.5
  );
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

  const unstagedFiles = useMemo(() => {
    const ret = [
      ...stat.unstagedFiles,
      ...stat.untrackedFiles.map((f) => ({ path: f, statusCode: "?" }))
    ];
    ret.sort((a, b) => a.path.localeCompare(b.path));
    return ret;
  }, [stat]);
  const unstagedListFocused = useCallback(() => {
    if (0 < unstagedFiles.length) {
      setSelection((cur) => ({
        unstagedIndex: Math.max(cur.unstagedIndex, 0),
        stagedIndex: cur.stagedIndex,
        active: "unstaged"
      }));
    }
  }, [unstagedFiles.length]);
  const stagedListFocused = useCallback(() => {
    setSelection((cur) => ({
      unstagedIndex: cur.unstagedIndex,
      stagedIndex: Math.max(cur.stagedIndex, 0),
      active: "staged"
    }));
  }, []);
  return (
    <SplitterPanel
      ratio={splitterRatio}
      onUpdateRatio={setSplitterRatio}
      allowDirectionChange={false}
      direction={orientation === "portrait" ? "vert" : "horiz"}
      first={
        <CustomSelectedIndexProvider
          itemsCount={unstagedFiles.length}
          value={unstagedIndex}
          setValue={setUnstagedIndex}
        >
          <FlexCard
            title="Unstaged changes"
            content={<FileList files={unstagedFiles} onFocus={unstagedListFocused} />}
          />
        </CustomSelectedIndexProvider>
      }
      second={
        <CustomSelectedIndexProvider
          itemsCount={stat.stagedFiles.length}
          value={stagedIndex}
          setValue={setStagedIndex}
        >
          <FlexCard
            title="Staged changes"
            content={<FileList files={stat.stagedFiles} onFocus={stagedListFocused} />}
          />
        </CustomSelectedIndexProvider>
      }
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};

export default memo(WorkingTree);
