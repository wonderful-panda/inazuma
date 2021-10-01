import { makeStyles, Typography } from "@material-ui/core";
import { memo } from "react";
import styled from "styled-components";
import FlexCard from "../FlexCard";
import FileList from "./FileList";

const useStyles = makeStyles({
  summary: {
    borderBottom: "1px solid"
  }
});

const Container = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export interface FileListCardProps {
  title?: string;
  files?: FileEntry[];
}
const FileListCard: React.VFC<FileListCardProps> = ({ title, files }) => {
  const styles = useStyles();
  const content = (
    <>
      {title && (
        <Typography variant="h5" component="div" className={styles.summary} gutterBottom>
          {title}
        </Typography>
      )}
      <Container>{files && <FileList files={files} />}</Container>
    </>
  );
  return <FlexCard content={content} />;
};

export default memo(FileListCard);
