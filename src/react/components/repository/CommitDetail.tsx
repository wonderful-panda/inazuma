import { Button, makeStyles, Typography } from "@material-ui/core";
import { memo, useCallback, useState } from "react";
import PersonIcon from "@material-ui/icons/Person";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import GitHash from "../GitHash";
import SplitterPanel from "../SplitterPanel";
import { formatDateLLL } from "@/date";
import styled from "styled-components";
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

const AttrDiv = styled.div`
  margin-right: 12px;
  display: flex;
  flex-flow: row nowrap;
`;

const useStyles = makeStyles({
  summary: {
    borderBottom: "1px solid"
  },
  badges: {
    display: "flex",
    flexFlow: "row wrap"
  },
  attrs: {
    display: "flex",
    flexFlow: "row wrap",
    color: "#aaa"
  },
  body: {
    margin: "1rem",
    flex: "0 1 auto",
    padding: "0.5rem",
    overflow: "auto"
  }
});

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

  const styles = useStyles();
  if (!commit) {
    return <FlexCard />;
  }
  const content = (
    <>
      <Typography variant="h5" component="div" className={styles.summary} gutterBottom>
        {commit.summary}
      </Typography>
      <Typography variant="body1" component="div" className={styles.attrs} gutterBottom>
        <AttrDiv>
          <GitHash hash={commit.id} />
        </AttrDiv>
        <AttrDiv>
          <PersonIcon />
          {commit.author}
        </AttrDiv>
        <AttrDiv>
          <AccessTimeIcon />
          {formatDateLLL(commit.date)}
        </AttrDiv>
      </Typography>
      <Typography variant="body1" className={styles.badges} gutterBottom>
        {refs.map((r) => (
          <RefBadge key={`${r.type}:${r.fullname}`} r={r} />
        ))}
      </Typography>
      {commit.body && (
        <Typography variant="body1" component="pre" className={styles.body} gutterBottom>
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
    />
  );
};

export default memo(CommitDetail);
