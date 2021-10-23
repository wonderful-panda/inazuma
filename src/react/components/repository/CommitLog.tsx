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
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { CommitLogItems } from "@/store/repository";
import { useSelectedIndex, useSelectedIndexMethods } from "@/hooks/useSelectedIndex";
import { serializeError } from "@/util";

const CommitLogInner: React.VFC<{ active: boolean; repoPath: string; log: CommitLogItems }> = ({
  active,
  repoPath,
  log
}) => {
  const dispatch = useDispatch();
  const [logDetail, setLogDetail] = useState<LogDetail | undefined>(undefined);
  const [currentRefs, setCurrentRefs] = useState<Ref[]>([]);
  const commandGroup = useCommandGroup();
  const selectedIndex = useSelectedIndex();
  const selectedIndexMethods = useSelectedIndexMethods();
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
            selectedIndexMethods.moveNext();
          }
        },
        {
          name: "PrevCommit",
          hotkey: "Ctrl+P",
          handler: () => {
            selectedIndexMethods.movePrevious();
          }
        }
      ]
    });
    return () => {
      commandGroup.unregister(groupName);
    };
  }, [active, selectedIndexMethods]);

  const selectLog = useCallback(
    debounce(async (index: number) => {
      if (!repoPath && index < 0) {
        return;
      }
      const sha = log.commits[index].id;
      try {
        setLogDetail(await browserApi.getLogDetail({ repoPath, sha }));
        setCurrentRefs(log.refs.refsById[sha] || []);
      } catch (error) {
        dispatch(SHOW_ERROR({ error: serializeError(error) }));
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
        <div className="flex flex-1 overflow-hidden m-2">
          <CommitList {...log} />
        </div>
      }
      second={
        <div className="flex flex-1 overflow-hidden m-2">
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

const CommitLog: React.VFC<{ active: boolean }> = ({ active }) => {
  const repoPath = useSelector((state) => state.repository.path);
  const log = useSelector((state) => state.repository.log);
  if (!repoPath || !log) {
    return <></>;
  }
  return (
    <SelectedIndexProvider itemsCount={log.commits.length} initialValue={0}>
      <CommitLogInner active={active} repoPath={repoPath} log={log} />
    </SelectedIndexProvider>
  );
};

export default CommitLog;
