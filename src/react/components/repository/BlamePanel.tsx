import type { FileLogEntry } from "@backend/FileLogEntry";
import classNames from "classnames";
import { use, useCallback, useMemo, useState } from "react";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useFileCommitContextMenu } from "@/hooks/useContextMenu";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import { usePromise } from "@/hooks/usePromise";
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
  blamePromise: Promise<RawBlame>;
  path: string;
  selectedCommitId: string | undefined;
  onUpdateSelectedCommitId: (value: string | undefined) => void;
  onContextMenu: (event: MouseEvent, commitId: string) => void;
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
  blamePromise,
  path,
  selectedCommitId,
  onUpdateSelectedCommitId,
  onContextMenu
}) => {
  const language = getLangIdFromPath(path);
  const [hoveredCommit, setHoveredCommit] = useState<BlameCommitMetadata | undefined>(undefined);
  const rawBlame = use(blamePromise);

  const blame = useMemo<Blame>(() => {
    const content = decodeToString(decodeBase64(rawBlame.contentBase64));
    const commitMetadata: Record<string, BlameCommitMetadata> = {};
    const commitIds: string[] = [];
    for (const { id, summary, author, date, lineNo } of rawBlame.blameEntries) {
      commitMetadata[id] = { id, summary, author, date };
      for (const line of lineNo) {
        commitIds[line - 1] = id;
      }
    }
    return { content, commitIds, commitMetadata };
  }, [rawBlame]);

  const onHoveredCommitIdChanged = useCallback(
    (value: string | undefined) => {
      setHoveredCommit(blame.commitMetadata[value ?? ""]);
    },
    [blame.commitMetadata]
  );
  return (
    <div className="flex-col-nowrap flex-1 p-1">
      <BlameViewer
        blame={blame}
        language={language}
        selectedCommitId={selectedCommitId}
        onUpdateSelectedcommitId={onUpdateSelectedCommitId}
        onHoveredCommitIdChanged={onHoveredCommitIdChanged}
        onContextMenu={onContextMenu}
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

  const [selectedCommitId, setSelectedCommitId] = useState<string | undefined>(undefined);

  const commits = usePromise<FileLogEntry[] | undefined>(commitsPromise, undefined);
  const handleRowContextMenu = useFileCommitContextMenu(relPath);
  const handleEditorContextMenu = useCallback(
    (e: MouseEvent, commitId: string) => {
      const commit = commits?.find((c) => c.id === commitId);
      if (!commit) {
        return;
      }
      handleRowContextMenu(e, -1, commit);
    },
    [commits, handleRowContextMenu]
  );

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
              blamePromise={blamePromise}
              path={relPath}
              selectedCommitId={selectedCommitId}
              onUpdateSelectedCommitId={setSelectedCommitId}
              onContextMenu={handleEditorContextMenu}
            />
          </LoadingSuspense>
        }
        allowDirectionChange
      />
    </>
  );
};

export const BlamePanel = withLoadingSuspense(BlamePanelInner, "flex-col-nowrap flex-1 px-2 pt-1");
