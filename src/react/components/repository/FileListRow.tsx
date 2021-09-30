import { vname } from "@/cssvar";
import { makeStyles, Typography } from "@material-ui/core";
import { memo } from "react";
import styled from "styled-components";
import FileStatusIcon from "./FileStatusIcon";

export const ROW_HEIGHT = 42;

export interface FileListRowProps {
  file: FileEntry;
  selected: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

const Container = styled.div<{ $selected: boolean }>`
  height: ${ROW_HEIGHT}px;
  display: flex;
  overflow: hidden;
  box-sizing: border-box;
  cursor: pointer;
  padding-left: 0.2rem 0.5rem;
  border-bottom: 1px solid #fff2;
  background-color: ${(p) => (p.$selected ? "#ffffff10" : undefined)};
  :hover {
    background-color: #ffffff10;
  }
`;

const RowContent = styled.div`
  font-family: var(${vname("monospaceFontfamily")});
  display: flex;
  flex: 1;
  overflow: hidden;
  padding-left: 4px;
  flex-flow: column nowrap;
`;

const FileStatusIconDiv = styled.div`
  margin: auto 0.5rem;
`;

const FileType = styled.div`
  font-weight: bold;
  padding: 0 2px;
  color: #888;
  margin: auto 4px;
  text-transform: uppercase;
`;

const NumStat = styled.div<{ $mode: "-" | "+" }>`
  color: ${(p) => (p.$mode === "+" ? "lightgreen" : "hotpink")};
  margin: auto 4px;
  :before {
    content: "${(p) => p.$mode}";
  }
`;

const OldPath = styled.div<{ $statusCode: string }>`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #aaa;
  :before {
    content: "${(p) => (p.$statusCode.startsWith("R") ? "Rename" : "Copy")} from";
    font-weight: bold;
    padding: 0 2px;
    color: #222;
    background-color: #888;
    margin: auto 4px;
  }
`;

const useStyles = makeStyles({
  firstLine: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: "24px",
    height: "24px"
  },
  secondLine: {
    color: "#aaa",
    whiteSpace: "nowrap",
    display: "flex",
    flexFlow: "row nowrap",
    lineHeight: "16px",
    height: "18px"
  }
});

const getFileType = (item: FileEntry) => {
  if (item.insertions === undefined) {
    return "unknown";
  } else if (item.insertions === "-") {
    return "binary";
  } else {
    return "text";
  }
};

const isNumberStat = (stat: "-" | number | undefined) => stat !== undefined && stat !== "-";

const FileListRow: React.VFC<FileListRowProps> = ({ file, selected }) => {
  const styles = useStyles();
  return (
    <Container $selected={selected}>
      <FileStatusIconDiv>
        <FileStatusIcon statusCode={file.statusCode} />
      </FileStatusIconDiv>
      <RowContent>
        <Typography variant="subtitle1" component="div" className={styles.firstLine}>
          {file.path}
        </Typography>
        <Typography variant="body2" component="div" className={styles.secondLine}>
          <FileType>{getFileType(file)}</FileType>
          {isNumberStat(file.insertions) && <NumStat $mode="+">{file.insertions}</NumStat>}
          {isNumberStat(file.deletions) && <NumStat $mode="-">{file.deletions}</NumStat>}
          {file.oldPath && <OldPath $statusCode={file.statusCode}>{file.oldPath}</OldPath>}
        </Typography>
      </RowContent>
    </Container>
  );
};

export default memo(FileListRow);
