import { useErrorReporter } from "@/hooks/useAlert";
import { useCallback, useEffect, useState } from "react";
import SplitterPanel from "../SplitterPanel";
import CommitDetail from "./CommitDetail";
import CommitList from "./CommitList";
import WorkingTree from "./WorkingTree";
import { usePersistState } from "@/hooks/usePersistState";
import { useRecoilValue } from "recoil";
import { commits$, graph$, refs$, repositoryPath$ } from "@/state/repository";
import browserApi from "@/browserApi";
import { debounce } from "lodash";

const CommitLog: React.VFC = () => {
  const repoPath = useRecoilValue(repositoryPath$);
  const commits = useRecoilValue(commits$);
  const graph = useRecoilValue(graph$);
  const refs = useRecoilValue(refs$);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [logDetail, setLogDetail] = useState<LogDetail | undefined>(undefined);
  const [currentRefs, setCurrentRefs] = useState<Ref[]>([]);
  const errorReporter = useErrorReporter();
  const selectLog = useCallback(
    debounce(async (index: number) => {
      if (!repoPath) {
        return;
      }
      const sha = commits[index].id;
      try {
        setLogDetail(await browserApi.getLogDetail({ repoPath, sha }));
        setCurrentRefs(refs.refsById[sha] || []);
      } catch (e) {
        errorReporter(e);
      }
    }, 200),
    [repoPath, commits, refs]
  );
  useEffect(() => {
    selectLog(selectedIndex);
  }, [selectedIndex]);
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
        <CommitList
          className="flex flex-1 overflow-hidden p-2"
          commits={commits}
          graph={graph}
          refs={refs}
          selectedIndex={selectedIndex}
          onUpdateSelectedIndex={setSelectedIndex}
        />
      }
      second={
        <div className="flex flex-1 overflow-hidden p-2">
          {logDetail === undefined || logDetail.type === "commit" ? (
            <CommitDetail commit={logDetail} refs={currentRefs} orientation={orientation} />
          ) : (
            <WorkingTree stat={logDetail} orientation={orientation} />
          )}
        </div>
      }
    />
  );
};

export default CommitLog;
