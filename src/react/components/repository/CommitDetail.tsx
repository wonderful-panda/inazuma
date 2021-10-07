import { Button, Typography } from "@material-ui/core";
import { memo, useCallback } from "react";
import PersonIcon from "@material-ui/icons/Person";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import GitHash from "../GitHash";
import SplitterPanel from "../SplitterPanel";
import { formatDateLLL } from "@/date";
import RefBadge from "./RefBadge";
import FileListCard from "./FileListCard";
import { useDispatch } from "@/store";
import { ADD_TAB } from "@/store/repository";
import FlexCard from "../FlexCard";
import { usePersistState } from "@/hooks/usePersistState";
import { getFileName, shortHash } from "@/util";

export interface CommitDetailProps {
  commit: CommitDetail | undefined;
  refs: Ref[];
  orientation: Orientation;
}

const CommitMetadata: React.VFC<CommitDetailProps> = memo(({ commit, refs }) => {
  if (!commit) {
    return <FlexCard />;
  }

  const content = (
    <>
      <Typography
        variant="h5"
        component="div"
        className="border-b border-solid border-current"
        gutterBottom
      >
        {commit.summary}
      </Typography>
      <Typography
        variant="body1"
        component="div"
        className="flex-row-wrap text-greytext"
        gutterBottom
      >
        <div className="flex-row-nowrap mr-4">
          <GitHash hash={commit.id} />
        </div>
        <div className="flex-row-nowrap mr-4">
          <PersonIcon />
          {commit.author}
        </div>
        <div className="flex-row-nowrap mr-4">
          <AccessTimeIcon />
          {formatDateLLL(commit.date)}
        </div>
      </Typography>
      <Typography variant="body1" className="flex-row-wrap" gutterBottom>
        {refs.map((r) => (
          <RefBadge key={`${r.type}:${r.fullname}`} r={r} />
        ))}
      </Typography>
      {commit.body && (
        <Typography
          variant="body1"
          component="pre"
          className="flex-initial m-4 p-2 overflow-hidden"
          gutterBottom
        >
          {commit.body}
        </Typography>
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
});

const CommitDetail: React.VFC<CommitDetailProps> = (props) => {
  const dispatch = useDispatch();
  const [splitterRatio, setSplitterRatio] = usePersistState(
    "repository/CommitDetail/splitter.ratio",
    0.5
  );
  const commit = props.commit;
  const addBlameTab = useCallback(
    (_1: React.UIEvent, _2: number, file: FileEntry) => {
      if (!commit) {
        return;
      }
      if (file.statusCode === "D") {
        return;
      }
      dispatch(
        ADD_TAB({
          type: "file",
          id: `blame:${commit.id}/${file.path}`,
          title: `${getFileName(file.path)} @ ${shortHash(commit.id)}`,
          payload: { path: file.path, sha: commit.id },
          closable: true
        })
      );
    },
    [commit]
  );

  return (
    <SplitterPanel
      ratio={splitterRatio}
      onUpdateRatio={setSplitterRatio}
      allowDirectionChange={false}
      direction={props.orientation === "portrait" ? "vert" : "horiz"}
      first={<CommitMetadata {...props} />}
      second={
        <FileListCard
          title={commit && "Changes"}
          files={commit && commit.files}
          onRowDoubleClick={addBlameTab}
        />
      }
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};

export default memo(CommitDetail);
