import { Card, CardContent, makeStyles, Typography } from "@material-ui/core";
import { memo, useMemo, useState } from "react";
import SplitterPanel from "../SplitterPanel";
import styled from "styled-components";
import FileList from "./FileList";

export type Orientation = "portrait" | "landscape";

export interface WorkingTreeProps {
  stat: WorkingTreeStat;
  orientation: Orientation;
}

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
  }
});

const WorkingTreeFileList: React.VFC<{ stat: WorkingTreeStat; staged: boolean }> = ({
  stat,
  staged
}) => {
  const styles = useStyles();
  const files = useMemo(() => {
    if (staged) {
      return stat.stagedFiles;
    } else {
      const ret = [
        ...stat.unstagedFiles,
        ...stat.untrackedFiles.map((f) => ({ path: f, statusCode: "?" }))
      ];
      ret.sort((a, b) => a.path.localeCompare(b.path));
      return ret;
    }
  }, [stat, staged]);
  return (
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>
        <Typography variant="h5" component="div" className={styles.summary} gutterBottom>
          {staged ? "Changes to be committed" : "Changes not staged"}
        </Typography>
        <FileListDiv>
          <FileList files={files} />
        </FileListDiv>
      </CardContent>
    </Card>
  );
};

const WorkingTree: React.VFC<WorkingTreeProps> = (props) => {
  const [splitterRatio, setSplitterRatio] = useState(0.5);
  return (
    <SplitterPanel
      ratio={splitterRatio}
      onUpdateRatio={setSplitterRatio}
      allowDirectionChange={false}
      direction={props.orientation === "portrait" ? "vert" : "horiz"}
      first={<WorkingTreeFileList stat={props.stat} staged={true} />}
      second={<WorkingTreeFileList stat={props.stat} staged={false} />}
    />
  );
};

export default memo(WorkingTree);
