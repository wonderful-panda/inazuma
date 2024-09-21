import { Button } from "@mui/material";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { RefBadge } from "./RefBadge";
import { FlexCard } from "../FlexCard";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import { FileList, useFileListRowEventHandler } from "./FileList";
import { useFileContextMenu } from "@/hooks/useContextMenu";
import { useDiffWithParentCommand } from "@/commands/diff";
import { useListIndexChanger } from "@/hooks/useListIndexChanger";
import type { VirtualListMethods } from "../VirtualList";
import { useShowFileContentCommand } from "@/commands/showFileContent";
import { KeyDownTrapper } from "../KeyDownTrapper";
import { useItemBasedListItemSelector } from "@/hooks/useItemBasedListItemSelector";
import PathFilter from "./PathFilter";
import { useCopyRelativePathCommand } from "@/commands/copyRelativePath";
import { useShowLsTree } from "@/hooks/actions/showLsTree";
import { CommitAttributes } from "./CommitAttributes";
import { NumStat } from "./NumStat";

export interface CommitDetailProps {
  commit: CommitDetail | undefined;
  refs: Ref[] | undefined;
  orientation: Orientation;
}

const CommitMetadataInner: React.FC<CommitDetailProps> = ({ commit, refs }) => {
  const showLsTree = useShowLsTree();
  const showSourceTree_ = useCallback(() => {
    if (commit) {
      void showLsTree(commit);
    }
  }, [commit, showLsTree]);
  if (!commit) {
    return <FlexCard />;
  }
  const content = (
    <>
      <div className="flex-col-wrap p-2 mb-2 border-b border-greytext">
        <CommitAttributes commit={commit} />
      </div>
      {refs && refs.length > 0 && (
        <div className="flex-row-wrap mx-2 mb-2">
          {refs.map((r) => (
            <RefBadge key={`${r.type}:${r.fullname}`} r={r} />
          ))}
        </div>
      )}
      {commit.body && (
        <pre className="flex-1 m-1 p-2 overflow-auto text-lg font-normal bg-tooltip text-greytext">
          {commit.body}
        </pre>
      )}
    </>
  );
  return (
    <FlexCard
      title={commit.summary}
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
    () => (commit ? commit.files.filter((f) => f.path.includes(filterText)) : []),
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
          title={
            commit && (
              <>
                <span className="flex-1 mt-1">Changes</span>
                <span className="text-base">
                  <NumStat files={commit.files} />
                </span>
              </>
            )
          }
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
