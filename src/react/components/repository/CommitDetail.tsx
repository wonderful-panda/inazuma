import { Button } from "@mui/material";
import { memo, useCallback, useMemo, useState } from "react";
import { useCopyRelativePathCommand } from "@/commands/copyRelativePath";
import { useDiffWithParentCommand } from "@/commands/diff";
import { useShowFileContentCommand } from "@/commands/showFileContent";
import { useShowLsTree } from "@/hooks/actions/showLsTree";
import { useFileContextMenu } from "@/hooks/useContextMenu";
import { FlexCard } from "../FlexCard";
import { PersistSplitterPanel } from "../PersistSplitterPanel";
import { CommitAttributes } from "./CommitAttributes";
import { FileList, useFileListRowEventHandler } from "./FileList";
import { NumStat } from "./NumStat";
import PathFilter from "./PathFilter";
import { RefBadge } from "./RefBadge";

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
        <Button disabled={!commit} onClick={showSourceTree_} color="inherit">
          Browse source
        </Button>
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
  const copyRelativePath = useCopyRelativePathCommand();
  const diffWithParent = useDiffWithParentCommand();
  const showFileContent = useShowFileContentCommand();
  const actionCommands = useMemo(
    () => [copyRelativePath, diffWithParent, showFileContent],
    [copyRelativePath, diffWithParent, showFileContent]
  );

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
                <FileList
                  commit={commit}
                  files={visibleFiles}
                  actionCommands={actionCommands}
                  onRowDoubleClick={onRowDoubleClick}
                  onRowContextMenu={onRowContextMenu}
                />
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
