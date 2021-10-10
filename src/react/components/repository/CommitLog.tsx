import { useErrorReporter } from "@/hooks/useAlert";
import { useCallback } from "react";
import SplitterPanel from "../SplitterPanel";
import CommitDetail from "./CommitDetail";
import CommitList from "./CommitList";
import WorkingTree from "./WorkingTree";
import { usePersistState } from "@/hooks/usePersistState";
import { useRecoilValue } from "recoil";
import {
  commits$,
  currentLogIndex$,
  currentRefs$,
  graph$,
  logDetail$,
  refs$,
  useLogAction
} from "@/state/repository";

const CommitLog: React.VFC = () => {
  const commits = useRecoilValue(commits$);
  const graph = useRecoilValue(graph$);
  const selectedIndex = useRecoilValue(currentLogIndex$);
  const refs = useRecoilValue(refs$);
  const currentEntry = useRecoilValue(logDetail$);
  const currentRefs = useRecoilValue(currentRefs$);
  const logAction = useLogAction();
  const errorReporter = useErrorReporter();
  const handleRowclick = useCallback((_: React.MouseEvent, index: number) => {
    try {
      logAction.selectLog(index);
    } catch (e) {
      errorReporter(e);
    }
  }, []);
  const [ratio, setRatio] = usePersistState("repository/CommitLog/splitter.ratio", 0.6);
  const [direction, setDirection] = usePersistState<Direction>(
    "repository/ComitLog/splitter.dir",
    "horiz"
  );
  const orientation = direction === "horiz" ? "portrait" : "landscape";

  return (
    <SplitterPanel
      direction={direction}
      splitterThickness={5}
      ratio={ratio}
      allowDirectionChange
      onUpdateRatio={setRatio}
      onUpdateDirection={setDirection}
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
      first={
        <div className="flex flex-1 overflow-hidden p-2">
          <CommitList
            commits={commits}
            graph={graph}
            refs={refs}
            selectedIndex={selectedIndex}
            onRowclick={handleRowclick}
          />
        </div>
      }
      second={
        <div className="flex flex-1 overflow-hidden p-2">
          {currentEntry === undefined || currentEntry.type === "commit" ? (
            <CommitDetail commit={currentEntry} refs={currentRefs} orientation={orientation} />
          ) : (
            <WorkingTree stat={currentEntry} orientation={orientation} />
          )}
        </div>
      }
    />
  );
};

export default CommitLog;
