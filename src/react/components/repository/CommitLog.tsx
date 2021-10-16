import { useCallback, useEffect, useState } from "react";
import SplitterPanel from "../SplitterPanel";
import CommitDetail from "./CommitDetail";
import CommitList from "./CommitList";
import WorkingTree from "./WorkingTree";
import { usePersistState } from "@/hooks/usePersistState";
import browserApi from "@/browserApi";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "@/store";
import { useCommandGroup } from "@/hooks/useCommandGroup";
import { SHOW_ERROR } from "@/store/misc";

const CommitLog: React.VFC<{ active: boolean }> = ({ active }) => {
  const repoPath = useSelector((state) => state.repository.path);
  const dispatch = useDispatch();
  const log = useSelector((state) => state.repository.log);
  if (!repoPath || !log) {
    return <></>;
  }
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [logDetail, setLogDetail] = useState<LogDetail | undefined>(undefined);
  const [currentRefs, setCurrentRefs] = useState<Ref[]>([]);
  const commandGroup = useCommandGroup();
  useEffect(() => {
    if (!active) {
      return;
    }
    const groupName = "CommitLog";
    commandGroup.register({
      groupName,
      commands: [
        {
          name: "NextCommit",
          hotkey: "Ctrl+N",
          handler: () => {
            setSelectedIndex((cur) => Math.min(cur + 1, log.commits.length - 1));
          }
        },
        {
          name: "PrevCommit",
          hotkey: "Ctrl+P",
          handler: () => {
            setSelectedIndex((cur) => Math.max(cur - 1, 0));
          }
        }
      ]
    });
    return () => {
      commandGroup.unregister(groupName);
    };
  }, [active, log.commits.length]);

  const selectLog = useCallback(
    debounce(async (index: number) => {
      if (!repoPath) {
        return;
      }
      const sha = log.commits[index].id;
      try {
        setLogDetail(await browserApi.getLogDetail({ repoPath, sha }));
        setCurrentRefs(log.refs.refsById[sha] || []);
      } catch (error) {
        dispatch(SHOW_ERROR({ error }));
      }
    }, 200),
    [repoPath, log.commits, log.refs]
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
          {...log}
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
