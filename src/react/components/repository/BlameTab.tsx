import useBrowserProcess from "@/hooks/useBrowserProcess";
import { usePersistState } from "@/hooks/usePersistState";
import { getLangIdFromPath } from "@/monaco";
import { useSelector } from "@/store";
import { useCallback, useEffect, useMemo, useState } from "react";
import Loading from "../Loading";
import SplitterPanel from "../SplitterPanel";
import BlameFooter from "./BlameFooter";
import BlameViewer from "./BlameViewer";
import FileCommitList from "./FileCommitList";

export interface BlamePanelProps {
  blame: Blame;
  path: string;
  selectedCommitId: string | undefined;
  onUpdateSelectedCommitId: (value: string | undefined) => void;
}

const BlamePanel: React.VFC<BlamePanelProps> = ({
  blame,
  path,
  selectedCommitId,
  onUpdateSelectedCommitId
}) => {
  const language = getLangIdFromPath(path);
  const [hoveredCommit, setHoveredCommit] = useState<Commit | undefined>(undefined);
  const commits = useMemo(() => {
    return blame.commits.reduce((prev, cur) => {
      prev[cur.id] = cur;
      return prev;
    }, {} as Record<string, Commit>);
  }, [blame]);
  const onHoveredCommitIdChanged = useCallback(
    (value: string | undefined) => {
      setHoveredCommit(value ? commits[value] : undefined);
    },
    [commits]
  );
  return (
    <div className="flex-col-nowrap flex-1 p-1">
      <BlameViewer
        blame={blame}
        language={language}
        selectedCommitId={selectedCommitId}
        onUpdateSelectedcommitId={onUpdateSelectedCommitId}
        onHoveredCommitIdChanged={onHoveredCommitIdChanged}
      />
      <BlameFooter commit={hoveredCommit} />
    </div>
  );
};

export interface BlameTabProps {
  path: string;
  sha: string;
  refs: Refs;
}

const BlameTab: React.VFC<BlameTabProps> = ({ path, sha, refs }) => {
  const [selectedCommitId, setSelectedCommitId] = useState<string | undefined>(undefined);
  const [blame, setBlame] = useState<Blame | undefined>(undefined);
  const repoPath = useSelector((state) => state.repository.repoPath);
  const browserProcess = useBrowserProcess();
  const onListRowClick = useCallback((_e, _index, commit: FileCommit) => {
    setSelectedCommitId(commit.id);
  }, []);
  const onUpdateSelectedCommitId = useCallback(
    (value: string | undefined) => {
      setSelectedCommitId(value);
    },
    [blame]
  );
  const selectedIndex = useMemo(
    () => (blame ? blame.commits.findIndex((c) => c.id === selectedCommitId) : -1),
    [blame, selectedCommitId]
  );
  useEffect(() => {
    if (!repoPath) {
      return;
    }
    setBlame(undefined);
    browserProcess.getBlame({ repoPath, relPath: path, sha: sha }).then((blame) => {
      setBlame(blame);
    });
  }, [path, sha]);
  const [ratio, setRatio] = usePersistState("repository/BlameTab/splitter.ratio", 0.3);
  const [direction, setDirection] = usePersistState(
    "reository/BlameTab/splitter.dir",
    "horiz" as Direction
  );
  return (
    <SplitterPanel
      first={
        blame ? (
          <div className="flex flex-1 m-2 box-border">
            <FileCommitList
              commits={blame.commits}
              refs={refs}
              selectedIndex={selectedIndex}
              onRowclick={onListRowClick}
            />
          </div>
        ) : (
          <Loading open />
        )
      }
      second={
        blame ? (
          <BlamePanel
            blame={blame}
            path={path}
            selectedCommitId={selectedCommitId}
            onUpdateSelectedCommitId={onUpdateSelectedCommitId}
          />
        ) : (
          <></>
        )
      }
      ratio={ratio}
      onUpdateRatio={setRatio}
      allowDirectionChange
      direction={direction}
      onUpdateDirection={setDirection}
    />
  );
};

export default BlameTab;
