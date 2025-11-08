import { debounce } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDiffAgainstCommand } from "@/commands/diff";
import { useAlert } from "@/context/AlertContext";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { useItemBasedListItemSelector } from "@/hooks/useItemBasedListItemSelector";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { decodeBase64, decodeToString } from "@/strings";
import { FlexCard } from "../FlexCard";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { Loading } from "../Loading";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import type { VirtualListMethods } from "../VirtualList";
import { CommitAttributes } from "./CommitAttributes";
import { DiffViewer } from "./DiffViewer";
import { FileList, useFileListRowEventHandler } from "./FileList";
import PathFilter from "./PathFilter";

export interface CommitDiffTabProps {
  repoPath: string;
  commitFrom: Commit | "parent";
  commitTo: Commit;
}

const getContent = async (
  repoPath: string,
  relPath: string,
  revspec: string
): Promise<TextFile> => {
  const s = await invokeTauriCommand("get_content_base64", {
    repoPath,
    relPath,
    revspec
  });
  const { text: content, encoding } = decodeToString(decodeBase64(s));
  return {
    content,
    encoding,
    path: relPath,
    revspec
  };
};

const loadContents = (
  repoPath: string,
  revspec1: string,
  revspec2: string,
  file: FileEntry | undefined
): Promise<[TextFile | undefined, TextFile | undefined]> => {
  if (!file) {
    return Promise.resolve([undefined, undefined]);
  }
  const leftPath = file.oldPath ?? file.path;
  const left =
    file.statusCode === "A" || file.delta?.type !== "text"
      ? Promise.resolve(undefined)
      : getContent(repoPath, leftPath, revspec1);
  const right =
    file.statusCode === "D" || file.delta?.type !== "text"
      ? Promise.resolve(undefined)
      : getContent(repoPath, file.path, revspec2);
  return Promise.all([left, right]);
};

const CommitDiffContent: React.FC<{
  repoPath: string;
  files: FileEntry[];
  commitFrom: Commit | "parent";
  commitTo: Commit;
}> = ({ repoPath, commitFrom, commitTo, files }) => {
  const listRef = useRef<VirtualListMethods>(null);
  const { selectedIndex, setSelectedIndex } = useItemBasedListItemSelector(files);
  const [filterText, setFilterText] = useState("");
  const visibleFiles = useMemo(
    () => files.filter((f) => f.path.includes(filterText)),
    [files, filterText]
  );
  const [content, setContent] = useState<[TextFile | undefined, TextFile | undefined]>([
    undefined,
    undefined
  ]);
  const [loading, setLoading] = useState(false);
  const { handleKeyDown, handleRowMouseDown } = useListIndexChanger(
    visibleFiles.length,
    setSelectedIndex
  );
  useEffect(() => {
    listRef.current?.scrollToItem(selectedIndex);
  }, [selectedIndex]);
  const { reportError } = useAlert();
  const diffAgainst = useDiffAgainstCommand(commitFrom);
  const actionCommands = useMemo(() => [diffAgainst] as const, [diffAgainst]);
  const handleRowDoubleClick = useFileListRowEventHandler(actionCommands[0], commitTo);
  const handleSelectFile = useMemo(
    () =>
      debounce(async (file: FileEntry | undefined) => {
        try {
          setLoading(true);
          setContent(
            await loadContents(
              repoPath,
              commitFrom === "parent" ? `${commitTo.id}~` : commitFrom.id,
              commitTo.id,
              file
            )
          );
        } catch (error) {
          reportError({ error });
        } finally {
          setLoading(false);
        }
      }, 200),
    [reportError, repoPath, commitFrom, commitTo]
  );
  useEffect(() => {
    void handleSelectFile(visibleFiles[selectedIndex]);
  }, [visibleFiles, selectedIndex, handleSelectFile]);

  const first = (
    <div className="flex flex-1 p-2">
      <FlexCard
        content={
          <div className="flex-1 flex-col-nowrap">
            {commitFrom !== "parent" && (
              <div className="p-2 mb-2 border border-greytext">
                <CommitAttributes commit={commitFrom} showSummary />
              </div>
            )}
            <div className="p-2 border border-greytext">
              <CommitAttributes commit={commitTo} showSummary />
            </div>
            <PathFilter onFilterTextChange={setFilterText} className="m-2" />
            <SelectedIndexProvider value={selectedIndex}>
              <KeyDownTrapper className="m-1 p-1" onKeyDown={handleKeyDown}>
                <FileList
                  ref={listRef}
                  commit={commitTo}
                  files={visibleFiles}
                  onRowMouseDown={handleRowMouseDown}
                  onRowDoubleClick={handleRowDoubleClick}
                  actionCommands={actionCommands}
                />
              </KeyDownTrapper>
            </SelectedIndexProvider>
          </div>
        }
      />
    </div>
  );
  const second = (
    <div className="relative flex-col-nowrap flex-1 p-2">
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

const CommitDiffTab: React.FC<CommitDiffTabProps> = ({ repoPath, commitFrom, commitTo }) => {
  const [files, setFiles] = useState<FileEntry[] | undefined>(undefined);
  const { reportError } = useAlert();
  useEffect(() => {
    (commitFrom !== "parent"
      ? invokeTauriCommand("get_changes_between", {
          repoPath,
          revspec1: commitFrom.id,
          revspec2: commitTo.id
        })
      : invokeTauriCommand("get_changes", {
          repoPath,
          revspec: commitTo.id
        })
    )
      .then((files) => setFiles(files))
      .catch((error) => reportError({ error }));
  }, [reportError, repoPath, commitFrom, commitTo]);
  if (!files) {
    return <Loading open />;
  } else {
    return <CommitDiffContent {...{ repoPath, commitFrom, commitTo, files }} />;
  }
};

export default CommitDiffTab;
