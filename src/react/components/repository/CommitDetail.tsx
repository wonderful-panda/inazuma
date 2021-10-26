import { Button } from "@material-ui/core";
import { memo } from "react";
import { Icon } from "@iconify/react";
import GitHash from "../GitHash";
import SplitterPanel from "../PersistSplitterPanel";
import { formatDateLLL } from "@/date";
import RefBadge from "./RefBadge";
import FlexCard from "../FlexCard";
import { SelectedIndexProvider } from "@/context/SelectedIndexContext";
import FileList, { useFileListRowEventHandler } from "./FileList";
import { useFileContextMenu } from "@/hooks/useContextMenu";
import { diffWithParent } from "@/commands/diff";

export interface CommitDetailProps {
  commit: CommitDetail | undefined;
  refs: Ref[];
  orientation: Orientation;
  fontSize: FontSize;
}

const CommitMetadataInner: React.VFC<CommitDetailProps> = ({ commit, refs }) => {
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
          {formatDateLLL(commit.date)}
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
          <Button disabled={!commit}>Browse source</Button>
        </>
      }
    />
  );
};
const CommitMetadata = memo(CommitMetadataInner);

const CommitDetail: React.VFC<CommitDetailProps> = (props) => {
  const commit = props.commit;
  const onRowDoubleClick = useFileListRowEventHandler(diffWithParent, commit);
  const onRowContextMenu = useFileContextMenu(commit);
  return (
    <SplitterPanel
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
              <SelectedIndexProvider itemsCount={commit.files.length || 0}>
                <FileList
                  files={commit.files}
                  fontSize={props.fontSize}
                  onRowDoubleClick={onRowDoubleClick}
                  onRowContextMenu={onRowContextMenu}
                />
              </SelectedIndexProvider>
            )
          }
        />
      }
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};

export default memo(CommitDetail);
