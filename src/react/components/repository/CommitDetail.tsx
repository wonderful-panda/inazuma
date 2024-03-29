import { Button } from "@mui/material";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "../Icon";
import { GitHash } from "../GitHash";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { formatDateTimeLong } from "@/date";
import { RefBadge } from "./RefBadge";
import { FlexCard } from "../FlexCard";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { FileList, useFileListRowEventHandler } from "./FileList";
import { useFileContextMenu } from "@/hooks/useContextMenu";
import { useDiffWithParentCommand } from "@/commands/diff";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import { VirtualListMethods } from "../VirtualList";
import { useShowFileContentCommand } from "@/commands/showFileContent";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { useItemBasedListItemSelector } from "@/hooks/useItemBasedListItemSelector";
import PathFilter from "./PathFilter";
import { useCopyRelativePathCommand } from "@/commands/copyRelativePath";
import { useShowLsTree } from "@/hooks/actions/showLsTree";

export interface CommitDetailProps {
  commit: CommitDetail | undefined;
  refs: Ref[];
  orientation: Orientation;
}

const CommitMetadataInner: React.FC<CommitDetailProps> = ({ commit, refs }) => {
  const showLsTree = useShowLsTree();
  const showSourceTree_ = useCallback(() => {
    if (commit) {
      showLsTree(commit);
    }
  }, [commit, showLsTree]);
  if (!commit) {
    return <FlexCard />;
  }
  const content = (
    <>
      <div className="border-b mb-1 border-solid border-current text-2xl">{commit.summary}</div>
      <div className="flex-row-wrap mb-1 text-greytext text-lg">
        <div className="flex-row-nowrap mr-4">
          <GitHash hash={commit.id} />
        </div>
        <div className="flex-row-nowrap mr-4">
          <Icon className="mr-0.5 my-auto" icon="mdi:account" />
          {commit.author}
        </div>
        <div className="flex-row-nowrap mr-4">
          <Icon className="mr-0.5 my-auto" icon="mdi:clock-outline" />
          {formatDateTimeLong(commit.date)}
        </div>
      </div>
      <div className="flex-row-wrap my-1">
        {refs.map((r) => (
          <RefBadge key={`${r.type}:${r.fullname}`} r={r} />
        ))}
      </div>
      {commit.body && (
        <pre className="flex-initial m-1 p-2 overflow-auto text-lg whitespace-pre-wrap font-normal">
          {commit.body}
        </pre>
      )}
    </>
  );
  return (
    <FlexCard
      content={content}
      actions={
        <>
          <Button disabled={!commit} onClick={showSourceTree_} color="inherit">
            Browse source
          </Button>
        </>
      }
    />
  );
};
const CommitMetadata = memo(CommitMetadataInner);

export const CommitDetail: React.FC<CommitDetailProps> = (props) => {
  const commit = props.commit;
  const [filterText, setFilterText] = useState("");
  const visibleFiles = useMemo(
    () => (commit ? commit.files.filter((f) => f.path.indexOf(filterText) >= 0) : []),
    [commit, filterText]
  );
  const { selectedIndex, setSelectedIndex } = useItemBasedListItemSelector(visibleFiles || []);
  useEffect(() => setSelectedIndex(-1), [commit, setSelectedIndex]);
  const listRef = useRef<VirtualListMethods>(null);
  const { handleKeyDown, handleRowMouseDown } = useListIndexChanger(
    visibleFiles.length || 0,
    setSelectedIndex
  );
  const copyRelativePath = useCopyRelativePathCommand();
  const diffWithParent = useDiffWithParentCommand();
  const showFileContent = useShowFileContentCommand();
  const actionCommands = useMemo(
    () => [copyRelativePath, diffWithParent, showFileContent],
    [copyRelativePath, diffWithParent, showFileContent]
  );

  useEffect(() => listRef.current?.scrollToItem(selectedIndex), [selectedIndex]);
  const onRowDoubleClick = useFileListRowEventHandler(diffWithParent, commit);
  const onRowContextMenu = useFileContextMenu(commit);
  return (
    <PersistSplitterPanel
      persistKey="repository/CommitDetail"
      initialRatio={0.5}
      allowDirectionChange={false}
      initialDirection={props.orientation === "portrait" ? "vert" : "horiz"}
      first={<CommitMetadata {...props} />}
      second={
        <FlexCard
          title={commit && "Changes"}
          content={
            commit && (
              <div className="flex-1 flex-col-nowrap">
                <PathFilter onFilterTextChange={setFilterText} className="m-2" />
                <SelectedIndexProvider value={selectedIndex}>
                  <KeyDownTrapper className="m-1 p-1" onKeyDown={handleKeyDown}>
                    <FileList
                      ref={listRef}
                      commit={commit}
                      files={visibleFiles}
                      actionCommands={actionCommands}
                      onRowMouseDown={handleRowMouseDown}
                      onRowDoubleClick={onRowDoubleClick}
                      onRowContextMenu={onRowContextMenu}
                    />
                  </KeyDownTrapper>
                </SelectedIndexProvider>
              </div>
            )
          }
        />
      }
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};
