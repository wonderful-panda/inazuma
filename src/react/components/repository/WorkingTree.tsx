import { usePersistState } from "@/hooks/usePersistState";
import { memo, useMemo } from "react";
import SplitterPanel from "../SplitterPanel";
import FileListCard from "./FileListCard";

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
      first={<FileListCard title="Unstaged changes" files={unstagedFiles} />}
      second={<FileListCard title="Staged changes" files={stat.stagedFiles} />}
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};

export default memo(WorkingTree);
