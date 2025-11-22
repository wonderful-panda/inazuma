import classNames from "classnames";
import { useCallback, useMemo, useState } from "react";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useFileCommitContextMenu } from "@/hooks/useContextMenu";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import { useTauriSuspenseQuery } from "@/hooks/useTauriQuery";
import { getLangIdFromPath, setup as setupMonaco } from "@/monaco";
import { decodeBase64, decodeToString } from "@/strings";
import { GitHash } from "../GitHash";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { BlameFooter } from "./BlameFooter";
import { BlameViewer } from "./BlameViewer";
import { CommitAttributes } from "./CommitAttributes";
import { FileCommitList } from "./FileCommitList";
import { withLoadingSuspense } from "./LoadingSuspense";

setupMonaco();

export interface SecondPanelProps {
  blame: Blame;
  path: string;
  selectedCommitId: string | undefined;
  onUpdateSelectedCommitId: (value: string | undefined) => void;
}

const FirstPanel: React.FC<{
  direction: Direction;
  showCommitAttrs: boolean;
  commit: Commit;
  path: string;
  blame: Blame;
  refs: Refs | undefined;
  selectedIndex: number;
  setSelectedIndex: SetState<number>;
}> = ({
  direction,
  showCommitAttrs,
  commit,
  path,
  blame,
  refs,
  selectedIndex,
  setSelectedIndex
}) => {
  const handleRowContextMenu = useFileCommitContextMenu(path);
  const { handleKeyDown, handleRowMouseDown } = useListIndexChanger(
    blame.commits.length,
    setSelectedIndex
  );
  const horiz = direction === "horiz";
  return (
    <div className={classNames("flex-1", horiz ? "flex-col-nowrap" : "flex-row-nowrap")}>
      {showCommitAttrs && (
        <div className={classNames("m-1 mb-3", !horiz && "max-w-2xl")}>
          <div className={classNames("p-2 border border-greytext")}>
            <CommitAttributes commit={commit} showSummary />
          </div>
        </div>
      )}
      <SelectedIndexProvider value={selectedIndex}>
        <KeyDownTrapper className="m-1 p-1 border border-paper" onKeyDown={handleKeyDown}>
          <FileCommitList
            commits={blame.commits}
            refs={refs}
            onRowMouseDown={handleRowMouseDown}
            onRowContextMenu={handleRowContextMenu}
          />
        </KeyDownTrapper>
      </SelectedIndexProvider>
    </div>
  );
};

const SecondPanel: React.FC<SecondPanelProps> = ({
  blame,
  path,
  selectedCommitId,
  onUpdateSelectedCommitId
}) => {
  const handleRowContextMenu = useFileCommitContextMenu(path);
  const language = getLangIdFromPath(path);
  const [hoveredCommit, setHoveredCommit] = useState<Commit | undefined>(undefined);
  const commits = useMemo(() => {
    return blame.commits.reduce(
      (prev, cur) => {
        prev[cur.id] = cur;
        return prev;
      },
      {} as Record<string, FileCommit>
    );
  }, [blame]);
  const onHoveredCommitIdChanged = useCallback(
    (value: string | undefined) => {
      setHoveredCommit(value ? commits[value] : undefined);
    },
    [commits]
  );
  const handleContextMenu = useCallback(
    (e: MouseEvent, commitId: string) => {
      const commit = commits[commitId];
      if (!commit) {
        return;
      }
      handleRowContextMenu(e, -1, commit);
    },
    [commits, handleRowContextMenu]
  );
  return (
    <div className="flex-col-nowrap flex-1 p-1">
      <BlameViewer
        blame={blame}
        language={language}
        selectedCommitId={selectedCommitId}
        onUpdateSelectedcommitId={onUpdateSelectedCommitId}
        onHoveredCommitIdChanged={onHoveredCommitIdChanged}
        onContextMenu={handleContextMenu}
      />
      <BlameFooter commit={hoveredCommit} />
    </div>
  );
};

export interface BlamePanelProps {
  persistKey: string;
  repoPath: string;
  commit: Commit;
  path: string;
  refs: Refs | undefined;
  showCommitAttrs?: boolean;
}

const BlamePanelInner: React.FC<BlamePanelProps> = ({
  repoPath,
  persistKey,
  commit,
  path,
  refs,
  showCommitAttrs = false
}) => {
  const { data: rawBlame } = useTauriSuspenseQuery("get_blame", {
    repoPath,
    relPath: path,
    revspec: commit.id
  });
  const blame = useMemo(() => {
    const content = decodeToString(decodeBase64(rawBlame.contentBase64));
    const commitIds: string[] = [];
    for (const entry of rawBlame.blameEntries) {
      for (const line of entry.lineNo) {
        commitIds[line - 1] = entry.id;
      }
    }
    return { commits: rawBlame.commits, content, commitIds };
  }, [rawBlame]);

  const [selectedItem, setSelectedItem] = useState({
    index: -1,
    commitId: undefined as string | undefined
  });
  const setSelectedIndex = useCallback<SetState<number>>(
    (value) => {
      setSelectedItem((cur) => {
        const index = typeof value === "function" ? value(cur.index) : value;
        const commitId = blame.commits[index]?.id;
        return { index, commitId };
      });
    },
    [blame]
  );

  const setSelectedCommitId = useCallback<SetState<string | undefined>>(
    (value) => {
      setSelectedItem((cur) => {
        const commitId = typeof value === "function" ? value(cur.commitId) : value;
        const index = blame.commits.findIndex((c) => c.id === commitId);
        return { index, commitId: 0 <= index ? commitId : undefined };
      });
    },
    [blame]
  );

  return (
    <>
      <div className="flex-row-nowrap items-center text-xl p-2 font-mono font-bold">
        <span className="pr-2 whitespace-nowrap text-secondary">{path}</span>
        <span className="text-greytext pr-2">@</span>
        <GitHash className="text-greytext" hash={commit.id} />
      </div>
      <PersistSplitterPanel
        persistKey={persistKey}
        initialRatio={0.3}
        initialDirection="horiz"
        first={(direction) => (
          <FirstPanel
            direction={direction}
            showCommitAttrs={showCommitAttrs}
            refs={refs}
            blame={blame}
            path={path}
            commit={commit}
            selectedIndex={selectedItem.index}
            setSelectedIndex={setSelectedIndex}
          />
        )}
        second={
          <SecondPanel
            blame={blame}
            path={path}
            selectedCommitId={selectedItem.commitId}
            onUpdateSelectedCommitId={setSelectedCommitId}
          />
        }
        allowDirectionChange
      />
    </>
  );
};

export const BlamePanel = withLoadingSuspense(BlamePanelInner, "flex-col-nowrap flex-1 px-2 pt-1");
