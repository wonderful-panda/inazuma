import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { usePersistState } from "@/hooks/usePersistState";
import { memo, useMemo } from "react";
import FlexCard from "../FlexCard";
import SplitterPanel from "../SplitterPanel";
import FileList from "./FileList";

export interface WorkingTreeProps {
  stat: WorkingTreeStat;
  orientation: Orientation;
}

const WorkingTree: React.VFC<WorkingTreeProps> = ({ stat, orientation }) => {
  const [splitterRatio, setSplitterRatio] = usePersistState(
    "repository/WorkingTree/splitter.ratio",
    0.5
  );
  const unstagedFiles = useMemo(() => {
    const ret = [
      ...stat.unstagedFiles,
      ...stat.untrackedFiles.map((f) => ({ path: f, statusCode: "?" }))
    ];
    ret.sort((a, b) => a.path.localeCompare(b.path));
    return ret;
  }, [stat]);
  return (
    <SplitterPanel
      ratio={splitterRatio}
      onUpdateRatio={setSplitterRatio}
      allowDirectionChange={false}
      direction={orientation === "portrait" ? "vert" : "horiz"}
      first={
        <SelectedIndexProvider itemsCount={unstagedFiles.length}>
          <FlexCard title="Unstaged changes" content={<FileList files={unstagedFiles} />} />
        </SelectedIndexProvider>
      }
      second={
        <SelectedIndexProvider itemsCount={stat.stagedFiles.length}>
          <FlexCard title="Staged changes" content={<FileList files={stat.stagedFiles} />} />
        </SelectedIndexProvider>
      }
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};

export default memo(WorkingTree);
