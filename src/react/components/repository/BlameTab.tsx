import browserApi from "@/browserApi";
import { CustomSelectedIndexProvider } from "@/context/SelectedIndexContext";
import { getLangIdFromPath, setup as setupMonaco } from "@/monaco";
import { useCallback, useEffect, useMemo, useState } from "react";
import Loading from "../Loading";
import SplitterPanel from "../PersistSplitterPanel";
import BlameFooter from "./BlameFooter";
import BlameViewer from "./BlameViewer";
import FileCommitList from "./FileCommitList";

setupMonaco();

export interface BlamePanelProps {
  blame: Blame;
  path: string;
  fontSize: number;
  selectedCommitId: string | undefined;
  onUpdateSelectedCommitId: (value: string | undefined) => void;
}

const BlamePanel: React.VFC<BlamePanelProps> = ({
  blame,
  path,
  fontSize,
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
        fontSize={fontSize}
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
  fontSize: FontSize;
}

const BlameTab: React.VFC<BlameTabProps> = ({ repoPath, path, sha, refs, fontSize }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [blame, setBlame] = useState<Blame | undefined>(undefined);
  const selectedCommitId = useMemo(() => {
    if (!blame) {
      return undefined;
    }
    return blame.commits[selectedIndex]?.id;
  }, [blame, selectedIndex]);

  console.log("BlameTab", fontSize);

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
  }, [repoPath, path, sha]);
  return !blame ? (
    <Loading open />
  ) : (
    <SplitterPanel
      persistKey="repository/BlameTab"
      initialRatio={0.3}
      initialDirection="horiz"
      first={
        <CustomSelectedIndexProvider
          itemsCount={blame.commits.length}
          value={selectedIndex}
          setValue={setSelectedIndex}
        >
          <FileCommitList commits={blame.commits} refs={refs} fontSize={fontSize} />
        </CustomSelectedIndexProvider>
      }
      second={
        <BlamePanel
          blame={blame}
          path={path}
          fontSize={fontSize === "medium" ? 15 : 12}
          selectedCommitId={selectedCommitId}
          onUpdateSelectedCommitId={onUpdateSelectedCommitId}
        />
      }
      allowDirectionChange
    />
  );
};

export default BlameTab;
