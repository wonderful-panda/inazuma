import _ from "lodash";
import { useMemo, useState } from "react";
import { useDiffAgainstCommand } from "@/commands/diff";
import { usePersistState } from "@/hooks/usePersistState";
import {
  type DeterministicTauriInvoke,
  useTauriSuspenseInvoke,
  useTauriSuspenseQuery
} from "@/hooks/useTauriQuery";
import { decodeBase64, decodeToString } from "@/strings";
import { FlexCard } from "../FlexCard";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { CommitAttributes } from "./CommitAttributes";
import { DiffViewer, type DiffViewerOptions } from "./DiffViewer";
import { FileList, type FileListViewType, useFileListRowEventHandler } from "./FileList";
import { LoadingSuspense } from "./LoadingSuspense";

export interface CommitDiffTabProps {
  repoPath: string;
  commitFrom: Commit | "parent";
  commitTo: Commit;
}

const getContent = async (
  queryInvoke: DeterministicTauriInvoke,
  repoPath: string,
  relPath: string,
  revspec: string
): Promise<TextFile> => {
  const s = await queryInvoke("get_content_base64", {
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
  queryInvoke: DeterministicTauriInvoke,
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
      : getContent(queryInvoke, repoPath, leftPath, revspec1);
  const right =
    file.statusCode === "D" || file.delta?.type !== "text"
      ? Promise.resolve(undefined)
      : getContent(queryInvoke, repoPath, file.path, revspec2);
  return Promise.all([left, right]);
};

const RightPanel: React.FC<{
  repoPath: string;
  commitFrom: Commit | "parent";
  commitTo: Commit;
  file: FileEntry | undefined;
}> = ({ repoPath, commitFrom, commitTo, file }) => {
  const [diffOptions, setDiffOptions] = usePersistState<DiffViewerOptions>(
    "repository/commitDiffTab/diffOptions",
    {}
  );
  const revspec1 = commitFrom === "parent" ? `${commitTo.id}~` : commitFrom.id;
  const revspec2 = commitTo.id;

  const {
    data: [left, right]
  } = useTauriSuspenseInvoke(["commitDiff", repoPath, revspec1, revspec2, file], (invoke) =>
    loadContents(invoke, repoPath, revspec1, revspec2, file)
  );

  return (
    <DiffViewer options={diffOptions} onOptionsChange={setDiffOptions} left={left} right={right} />
  );
};
const CommitDiffContent: React.FC<{
  repoPath: string;
  commitFrom: Commit | "parent";
  commitTo: Commit;
}> = ({ repoPath, commitFrom, commitTo }) => {
  const revspec1 = commitFrom === "parent" ? `${commitTo.id}~` : commitFrom.id;
  const revspec2 = commitTo.id;
  const { data: files } = useTauriSuspenseQuery("get_changes_between", {
    repoPath,
    revspec1,
    revspec2
  });
  const [selectedFile, setSelectedFile] = useState<FileEntry | undefined>(undefined);
  const [fileView, setFileView] = usePersistState<FileListViewType>(
    "repository/commitDiffTab/fileView",
    "flat"
  );
  const diffAgainst = useDiffAgainstCommand(commitFrom);
  const actionCommands = useMemo(() => [diffAgainst] as const, [diffAgainst]);
  const handleRowDoubleClick = useFileListRowEventHandler(actionCommands[0], commitTo);
  const handleSelectionChange = useMemo(
    () =>
      _.debounce((_: number, item: FileEntry | undefined) => {
        setSelectedFile(item);
      }, 250),
    []
  );

  const first = (
    <div className="flex flex-1 p-2">
      <FlexCard
        content={
          <div className="flex-1 flex-col-nowrap p-1">
            {commitFrom !== "parent" && (
              <div className="p-2 mb-2 border border-greytext">
                <CommitAttributes commit={commitFrom} showSummary />
              </div>
            )}
            <div className="p-1 border border-greytext">
              <CommitAttributes commit={commitTo} showSummary />
            </div>
            <FileList
              view={fileView}
              onViewChange={setFileView}
              commit={commitTo}
              files={files}
              onRowDoubleClick={handleRowDoubleClick}
              onSelectionChange={handleSelectionChange}
              actionCommands={actionCommands}
            />
          </div>
        }
      />
    </div>
  );
  const second = (
    <LoadingSuspense containerClass="relative flex flex-1 p-2">
      <RightPanel
        repoPath={repoPath}
        commitFrom={commitFrom}
        commitTo={commitTo}
        file={selectedFile}
      />
    </LoadingSuspense>
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
  return (
    <LoadingSuspense containerClass="flex flex-1">
      <CommitDiffContent {...{ repoPath, commitFrom, commitTo }} />
    </LoadingSuspense>
  );
};

export default CommitDiffTab;
