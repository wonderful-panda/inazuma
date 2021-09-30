import { Button, Card, CardActions, CardContent, makeStyles, Typography } from "@material-ui/core";
import { memo, useCallback, useState } from "react";
import PersonIcon from "@material-ui/icons/Person";
import AccessTimeIcon from "@material-ui/icons/AccessTime";
import GitHash from "../GitHash";
import SplitterPanel from "../SplitterPanel";
import { formatDateLLL } from "@/date";
import styled from "styled-components";
import RefBadge from "./RefBadge";
import FileList from "./FileList";
import { useDispatch } from "@/store";
import { ADD_TAB } from "@/store/repository";

export type Orientation = "portrait" | "landscape";

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

const FileListDiv = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const useStyles = makeStyles({
  card: {
    display: "flex",
    flexFlow: "column nowrap",
    flex: 1
  },
  cardContent: {
    display: "flex",
    flexFlow: "column nowrap",
    flex: 1,
    overflow: "hidden"
  },
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
  },
  cardActions: {
    marginLeft: "auto"
  }
});

const CommitMetadata: React.VFC<CommitDetailProps> = ({ commit, refs }) => {
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
    return <Card className={styles.card} />;
  }
  return (
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>
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
      </CardContent>
      <CardActions className={styles.cardActions}>
        <Button onClick={addTestTab}>Test</Button>
        <Button disabled={!commit}>Browse source</Button>
      </CardActions>
    </Card>
  );
};

const CommitFileList: React.VFC<{ commit?: CommitDetail }> = ({ commit }) => {
  const styles = useStyles();
  return (
    <Card className={styles.card}>
      {commit && (
        <CardContent className={styles.cardContent}>
          <Typography variant="h5" component="div" className={styles.summary} gutterBottom>
            Changed files
          </Typography>
          <FileListDiv>{commit && <FileList files={commit.files} />}</FileListDiv>
        </CardContent>
      )}
    </Card>
  );
};

const CommitDetail: React.VFC<CommitDetailProps> = (props) => {
  const [splitterRatio, setSplitterRatio] = useState(0.5);
  return (
    <SplitterPanel
      ratio={splitterRatio}
      onUpdateRatio={setSplitterRatio}
      allowDirectionChange={false}
      direction={props.orientation === "portrait" ? "vert" : "horiz"}
      first={<CommitMetadata {...props} />}
      second={<CommitFileList commit={props.commit} />}
    />
  );
};

export default memo(CommitDetail);
