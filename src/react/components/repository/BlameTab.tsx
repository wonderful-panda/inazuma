import browserApi from "@/browserApi";
import { usePersistState } from "@/hooks/usePersistState";
import { getLangIdFromPath } from "@/monaco";
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
  repoPath: string;
  path: string;
  sha: string;
  refs: Refs | undefined;
}

const BlameTab: React.VFC<BlameTabProps> = ({ repoPath, path, sha, refs }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [blame, setBlame] = useState<Blame | undefined>(undefined);
  const selectedCommitId = useMemo(() => {
    if (!blame) {
      return undefined;
    }
    return blame.commits[selectedIndex]?.id;
  }, [blame, selectedIndex]);

  const onUpdateSelectedCommitId = useCallback(
    (value: string | undefined) => {
      if (!blame || value === undefined) {
        setSelectedIndex(-1);
      } else {
        const index = blame.commits.findIndex((c) => c.id === value);
        setSelectedIndex(index);
      }
    },
    [blame]
  );
  useEffect(() => {
    if (!repoPath) {
      return;
    }
    setBlame(undefined);
    browserApi.getBlame({ repoPath, relPath: path, sha: sha }).then((blame) => {
      setBlame(blame);
    });
  }, [path, sha]);
  const [ratio, setRatio] = usePersistState("repository/BlameTab/splitter.ratio", 0.3);
  const [direction, setDirection] = usePersistState(
    "reository/BlameTab/splitter.dir",
    "horiz" as Direction
  );
  return !blame ? (
    <Loading open />
  ) : (
    <SplitterPanel
      first={
        <FileCommitList
          commits={blame.commits}
          refs={refs}
          selectedIndex={selectedIndex}
          onUpdateSelectedIndex={setSelectedIndex}
        />
      }
      second={
        <BlamePanel
          blame={blame}
          path={path}
          selectedCommitId={selectedCommitId}
          onUpdateSelectedCommitId={onUpdateSelectedCommitId}
        />
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
