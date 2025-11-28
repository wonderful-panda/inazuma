import type { FileLogEntry } from "@backend/FileLogEntry";
import classNames from "classnames";
import { use, useCallback, useMemo, useState } from "react";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useFileCommitContextMenu } from "@/hooks/useContextMenu";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import { useTauriQueryInvoke } from "@/hooks/useTauriQuery";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { getLangIdFromPath, setup as setupMonaco } from "@/monaco";
import { decodeBase64, decodeToString } from "@/strings";
import { GitHash } from "../GitHash";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { BlameFooter } from "./BlameFooter";
import { BlameViewer } from "./BlameViewer";
import { CommitAttributes } from "./CommitAttributes";
import { FileCommitList } from "./FileCommitList";
import { LoadingSuspense, withLoadingSuspense } from "./LoadingSuspense";

setupMonaco();

export interface SecondPanelProps {
  lazyData: Promise<[FileLogEntry[], RawBlame]>;
  path: string;
  selectedCommitId: string | undefined;
  onUpdateSelectedCommitId: (value: string | undefined) => void;
}

const FirstPanel: React.FC<{
  direction: Direction;
  showCommitAttrs: boolean;
  commit: Commit;
  lazyData: Promise<[FileLogEntry[], string | undefined]>;
  path: string;
  refs: Refs | undefined;
  selectedCommitId: string | undefined;
  onUpdateSelectedCommitId: SetState<string | undefined>;
}> = ({
  direction,
  showCommitAttrs,
  commit,
  lazyData,
  path,
  refs,
  selectedCommitId,
  onUpdateSelectedCommitId
}) => {
  const [commits, lastModifiedCommitId] = use(lazyData);
  const commitIdToIndex = useMemo(
    () => new Map(commits.map((c, index) => [c.id, index] as const)),
    [commits]
  );
  const selectedIndex = commitIdToIndex.get(selectedCommitId ?? "") ?? -1;
  const setSelectedIndex = useCallback<SetState<number>>(
    (value) => {
      onUpdateSelectedCommitId((curentId) => {
        if (typeof value === "function") {
          const currentIndex = commitIdToIndex.get(curentId ?? "") ?? -1;
          return commits[value(currentIndex)]?.id;
        } else {
          return commits[value]?.id;
        }
      });
    },
    [commits, commitIdToIndex, onUpdateSelectedCommitId]
  );

  const handleRowContextMenu = useFileCommitContextMenu(path);
  const { handleKeyDown, handleRowMouseDown } = useListIndexChanger(
    commits.length,
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
            commits={commits}
            refs={refs}
            markedCommitId={lastModifiedCommitId}
            onRowMouseDown={handleRowMouseDown}
            onRowContextMenu={handleRowContextMenu}
          />
        </KeyDownTrapper>
      </SelectedIndexProvider>
    </div>
  );
};

const SecondPanel: React.FC<SecondPanelProps> = ({
  lazyData,
  path,
  selectedCommitId,
  onUpdateSelectedCommitId
}) => {
  const handleRowContextMenu = useFileCommitContextMenu(path);
  const language = getLangIdFromPath(path);
  const [hoveredCommit, setHoveredCommit] = useState<Commit | undefined>(undefined);

  const [commits, rawBlame] = use(lazyData);
  const commitMap = useMemo(() => new Map(commits.map((c) => [c.id, c])), [commits]);
  const blame = useMemo(() => {
    const content = decodeToString(decodeBase64(rawBlame.contentBase64));
    const commitIds: string[] = [];
    for (const entry of rawBlame.blameEntries) {
      for (const line of entry.lineNo) {
        commitIds[line - 1] = entry.id;
      }
    }
    return { commits, content, commitIds };
  }, [commits, rawBlame]);

  const onHoveredCommitIdChanged = useCallback(
    (value: string | undefined) => {
      setHoveredCommit(value ? commitMap.get(value) : undefined);
    },
    [commitMap]
  );
  const handleContextMenu = useCallback(
    (e: MouseEvent, commitId: string) => {
      const commit = commitMap.get(commitId);
      if (!commit) {
        return;
      }
      handleRowContextMenu(e, -1, commit);
    },
    [commitMap, handleRowContextMenu]
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
  path: relPath,
  refs,
  showCommitAttrs = false
}) => {
  const invoke = useTauriQueryInvoke();
  const commitsPromise = useMemo(() => {
    return invokeTauriCommand("get_filelog", {
      repoPath,
      relPath,
      maxCount: 1000,
      all: true,
      heads: []
    });
  }, [repoPath, relPath]);
  const lastModifiedCommitPromise = useMemo(
    () =>
      invoke("get_last_modify_commit", { repoPath, relPath, revspec: commit.id }).then(
        (c) => c?.id
      ),
    [invoke, repoPath, relPath, commit.id]
  );
  const blamePromise = useMemo(
    () => invoke("get_blame", { repoPath, relPath, revspec: commit.id }),
    [invoke, repoPath, relPath, commit.id]
  );

  const leftPromise = useMemo(
    () => Promise.all([commitsPromise, lastModifiedCommitPromise]),
    [commitsPromise, lastModifiedCommitPromise]
  );
  const rightPromise = useMemo(
    () => Promise.all([commitsPromise, blamePromise]),
    [commitsPromise, blamePromise]
  );

  const [selectedCommitId, setSelectedCommitId] = useState<string | undefined>(undefined);

  return (
    <>
      <div className="flex-row-nowrap items-center text-xl p-2 font-mono font-bold">
        <span className="pr-2 whitespace-nowrap text-secondary">{relPath}</span>
        <span className="text-greytext pr-2">@</span>
        <GitHash className="text-greytext" hash={commit.id} />
      </div>
      <PersistSplitterPanel
        persistKey={persistKey}
        initialRatio={0.3}
        initialDirection="horiz"
        first={(direction) => (
          <LoadingSuspense containerClass="flex flex-1">
            <FirstPanel
              direction={direction}
              showCommitAttrs={showCommitAttrs}
              refs={refs}
              lazyData={leftPromise}
              path={relPath}
              commit={commit}
              selectedCommitId={selectedCommitId}
              onUpdateSelectedCommitId={setSelectedCommitId}
            />
          </LoadingSuspense>
        )}
        second={
          <LoadingSuspense containerClass="flex flex-1">
            <SecondPanel
              lazyData={rightPromise}
              path={relPath}
              selectedCommitId={selectedCommitId}
              onUpdateSelectedCommitId={setSelectedCommitId}
            />
          </LoadingSuspense>
        }
        allowDirectionChange
      />
    </>
  );
};

export const BlamePanel = withLoadingSuspense(BlamePanelInner, "flex-col-nowrap flex-1 px-2 pt-1");
