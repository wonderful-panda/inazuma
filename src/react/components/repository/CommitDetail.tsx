import { Button, Typography } from "@material-ui/core";
import { memo, useCallback, useState } from "react";
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

export interface CommitDetailProps {
  commit: CommitDetail | undefined;
  refs: Ref[];
  orientation: Orientation;
}

const CommitMetadata: React.VFC<CommitDetailProps> = memo(({ commit, refs }) => {
  const dispatch = useDispatch();
  const addTestTab = useCallback(() => {
    const id = Date.now().toString();
    dispatch(
      ADD_TAB({
        type: "file",
        id,
        title: `TAB-${id}`,
        payload: { path: "XXX", sha: "XXXX" },
        closable: true
      })
    );
  }, []);

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
          <Button onClick={addTestTab}>Test</Button>
          <Button disabled={!commit}>Browse source</Button>
        </>
      }
    />
  );
});

const CommitDetail: React.VFC<CommitDetailProps> = (props) => {
  const [splitterRatio, setSplitterRatio] = useState(0.5);
  const commit = props.commit;
  return (
    <SplitterPanel
      ratio={splitterRatio}
      onUpdateRatio={setSplitterRatio}
      allowDirectionChange={false}
      direction={props.orientation === "portrait" ? "vert" : "horiz"}
      first={<CommitMetadata {...props} />}
      second={<FileListCard title={commit && "Changed files"} files={commit && commit.files} />}
      firstPanelMinSize="20%"
      secondPanelMinSize="20%"
    />
  );
};

export default memo(CommitDetail);
