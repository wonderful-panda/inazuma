import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import useListItemSelector from "@/hooks/useListItemSelector";
import { getLangIdFromPath, setup as setupMonaco } from "@/monaco";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SplitterPanel from "../PersistSplitterPanel";
import { VirtualListMethods } from "../VirtualList";
import BlameFooter from "./BlameFooter";
import BlameViewer from "./BlameViewer";
import FileCommitList from "./FileCommitList";

setupMonaco();

export interface SecondPanelProps {
  blame: Blame;
  path: string;
  fontSize: number;
  selectedCommitId: string | undefined;
  onUpdateSelectedCommitId: (value: string | undefined) => void;
}

const SecondPanel: React.VFC<SecondPanelProps> = ({
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

export interface BlamePanelProps {
  persistKey: string;
  blame: Blame;
  path: string;
  sha: string;
  refs: Refs | undefined;
  fontSize: FontSize;
}

const BlamePanel: React.VFC<BlamePanelProps> = ({ persistKey, blame, path, refs, fontSize }) => {
  const [selectedItem, setSelectedItem] = useState({
    index: -1,
    commitId: undefined as string | undefined
  });
  const setSelectedIndex = useCallback(
    (value: React.SetStateAction<number>) => {
      setSelectedItem((cur) => {
        const index = typeof value === "function" ? value(cur.index) : value;
        const commitId = blame.commits[index]?.id;
        return { index, commitId };
      });
    },
    [blame]
  );

  const setSelectedCommitId = useCallback(
    (value: React.SetStateAction<string | undefined>) => {
      setSelectedItem((cur) => {
        const commitId = typeof value === "function" ? value(cur.commitId) : value;
        const index = blame.commits.findIndex((c) => c.id === commitId);
        return { index, commitId: 0 <= index ? commitId : undefined };
      });
    },
    [blame]
  );

  const { handleKeyDown, handleRowClick } = useListItemSelector(
    blame?.commits.length || 0,
    setSelectedIndex
  );
  const listRef = useRef<VirtualListMethods>(null);

  useEffect(() => listRef.current?.scrollToItem(selectedItem.index), [selectedItem.index]);

  return (
    <SplitterPanel
      persistKey={persistKey}
      initialRatio={0.3}
      initialDirection="horiz"
      first={
        <SelectedIndexProvider value={selectedItem.index}>
          <div className="flex flex-1 m-1 p-1" tabIndex={0} onKeyDown={handleKeyDown}>
            <FileCommitList
              ref={listRef}
              commits={blame.commits}
              refs={refs}
              fontSize={fontSize}
              onRowClick={handleRowClick}
            />
          </div>
        </SelectedIndexProvider>
      }
      second={
        <SecondPanel
          blame={blame}
          path={path}
          fontSize={fontSize === "medium" ? 15 : 12}
          selectedCommitId={selectedItem.commitId}
          onUpdateSelectedCommitId={setSelectedCommitId}
        />
      }
      allowDirectionChange
    />
  );
};

export default BlamePanel;
