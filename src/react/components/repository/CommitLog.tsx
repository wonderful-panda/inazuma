import { useCallback, useEffect, useMemo, useState } from "react";
import SplitterPanel from "../PersistSplitterPanel";
import CommitDetail from "./CommitDetail";
import CommitList from "./CommitList";
import WorkingTree from "./WorkingTree";
import browserApi from "@/browserApi";
import { debounce } from "lodash";
import { useDispatch, useSelector } from "@/store";
import { useCommandGroup } from "@/hooks/useCommandGroup";
import { SHOW_ERROR } from "@/store/misc";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { CommitLogItems } from "@/store/repository";
import { useSelectedIndex, useSelectedIndexMethods } from "@/hooks/useSelectedIndex";
import { serializeError } from "@/util";

const CommitLogInner: React.VFC<{
  active: boolean;
  repoPath: string;
  log: CommitLogItems;
  fontSize: FontSize;
}> = ({ active, repoPath, log, fontSize }) => {
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
  }, [active, selectedIndexMethods, commandGroup]);

  const selectLog = useMemo(
    () =>
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
    [repoPath, log.commits, log.refs, dispatch]
  );
  useEffect(() => {
    selectLog(selectedIndex);
  }, [selectedIndex, selectLog]);

  const detail = useCallback(
    (direction: Direction) => {
      const orientation = direction === "horiz" ? "portrait" : "landscape";
      return (
        <div className="flex flex-1 overflow-hidden m-2">
          {logDetail === undefined || logDetail.type === "commit" ? (
            <CommitDetail
              commit={logDetail}
              refs={currentRefs}
              orientation={orientation}
              fontSize={fontSize}
            />
          ) : (
            <WorkingTree stat={logDetail} orientation={orientation} fontSize={fontSize} />
          )}
        </div>
      );
    },
    [currentRefs, logDetail, fontSize]
  );

  return (
    <SplitterPanel
      persistKey="repository/CommitLog"
      initialDirection="horiz"
      initialRatio={0.7}
      splitterThickness={5}
      allowDirectionChange
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
      first={
        <div className="flex flex-1 overflow-hidden m-2">
          <CommitList {...log} fontSize={fontSize} />
        </div>
      }
      second={detail}
    />
  );
};

const CommitLog: React.VFC<{ active: boolean }> = ({ active }) => {
  const repoPath = useSelector((state) => state.repository.path);
  const log = useSelector((state) => state.repository.log);
  const fontSize = useSelector((state) => state.persist.config.fontSize);
  if (!repoPath || !log) {
    return <></>;
  }
  return (
    <SelectedIndexProvider itemsCount={log.commits.length} initialValue={0}>
      <CommitLogInner active={active} repoPath={repoPath} log={log} fontSize={fontSize} />
    </SelectedIndexProvider>
  );
};

export default CommitLog;
