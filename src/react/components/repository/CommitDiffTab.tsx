import { dispatchBrowser } from "@/dispatchBrowser";
import { useDispatch } from "@/store";
import { SHOW_ERROR } from "@/store/misc";
import { serializeError, shortHash } from "@/util";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { FileList, useFileListRowEventHandler } from "./FileList";
import { Loading } from "../Loading";
import { FlexCard } from "../FlexCard";
import { VirtualListMethods } from "../VirtualList";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useListItemSelector } from "@/hooks/useListItemSelector";
import { diffAgainst } from "@/commands/diff";
import { DiffViewer } from "./DiffViewer";
import { debounce } from "lodash";
import { KeyDownTrapper } from "../KeyDownTrapper";

export interface CommitDiffTabProps {
  repoPath: string;
  commit1: Commit;
  commit2: Commit;
}

const loadContents = (
  repoPath: string,
  sha1: string,
  sha2: string,
  file: FileEntry | undefined
): Promise<[TextFile | undefined, TextFile | undefined]> => {
  if (!file) {
    return Promise.resolve([undefined, undefined]);
  }
  const leftPath = file.oldPath || file.path;
  const left =
    file.statusCode === "A" || file.delta?.type !== "text"
      ? Promise.resolve(undefined)
      : dispatchBrowser("getTextFileContent", {
          repoPath,
          file: { path: leftPath, revspec: sha1 }
        });
  const right =
    file.statusCode === "D" || file.delta?.type !== "text"
      ? Promise.resolve(undefined)
      : dispatchBrowser("getTextFileContent", {
          repoPath,
          file: { path: file.path, revspec: sha2 }
        });
  return Promise.all([left, right]);
};

const CommitDiffContent: React.VFC<{
  repoPath: string;
  files: FileEntry[];
  commit1: Commit;
  commit2: Commit;
}> = ({ repoPath, commit1, commit2, files }) => {
  const dispatch = useDispatch();
  const listRef = useRef<VirtualListMethods>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [content, setContent] = useState<[TextFile | undefined, TextFile | undefined]>([
    undefined,
    undefined
  ]);
  const [loading, setLoading] = useState(false);
  const itemSelector = useListItemSelector(files.length, setSelectedIndex);
  useEffect(() => listRef.current?.scrollToItem(selectedIndex), [selectedIndex]);
  const actionCommands = useMemo(() => [diffAgainst(commit1)], [commit1]);
  const handleRowDoubleClick = useFileListRowEventHandler(actionCommands[0], commit2);
  const handleSelectFile = useMemo(
    () =>
      debounce(async (file: FileEntry | undefined) => {
        try {
          console.log("selectFile");
          setLoading(true);
          setContent(await loadContents(repoPath, commit1.id, commit2.id, file));
        } catch (e) {
          dispatch(SHOW_ERROR({ error: serializeError(e) }));
        } finally {
          setLoading(false);
        }
      }, 200),
    [dispatch, repoPath, commit1, commit2]
  );
  useEffect(() => {
    handleSelectFile(files[selectedIndex]);
  }, [files, selectedIndex, handleSelectFile]);

  const first = (
    <div className="flex flex-1 p-2">
      <FlexCard
        title={`Changes ${shortHash(commit1.id)} - ${shortHash(commit2.id)}`}
        content={
          <SelectedIndexProvider value={selectedIndex}>
            <KeyDownTrapper className="m-1 p-1" onKeyDown={itemSelector.handleKeyDown}>
              <FileList
                ref={listRef}
                commit={commit2}
                files={files}
                onRowClick={itemSelector.handleRowClick}
                onRowDoubleClick={handleRowDoubleClick}
                actionCommands={actionCommands}
              />
            </KeyDownTrapper>
          </SelectedIndexProvider>
        }
      />
    </div>
  );
  const second = (
    <div className="relative flex flex-1 p-2">
      <DiffViewer left={content[0]} right={content[1]} />
      {loading && <Loading open />}
    </div>
  );

  return (
    <PersistSplitterPanel
      persistKey="repository/commitDiffTab"
      initialDirection="horiz"
      initialRatio={0.3}
      first={first}
      second={second}
    />
  );
};

const CommitDiffTab: React.VFC<CommitDiffTabProps> = ({ repoPath, commit1, commit2 }) => {
  const dispatch = useDispatch();
  const [files, setFiles] = useState<FileEntry[] | undefined>(undefined);
  useEffect(() => {
    dispatchBrowser("getCommitDiff", {
      repoPath,
      sha1: commit1.id,
      sha2: commit2.id
    })
      .then((files) => setFiles(files))
      .catch((e) => dispatch(SHOW_ERROR({ error: serializeError(e) })));
  }, [dispatch, repoPath, commit1, commit2]);
  if (!files) {
    return <Loading open />;
  } else {
    return (
      <CommitDiffContent repoPath={repoPath} commit1={commit1} commit2={commit2} files={files} />
    );
  }
};

export default CommitDiffTab;
