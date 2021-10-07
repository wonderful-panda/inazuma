import { Typography } from "@material-ui/core";
import { memo } from "react";
import FlexCard from "../FlexCard";
import FileList from "./FileList";

export interface FileListCardProps {
  title?: string;
  files?: FileEntry[];
  onRowClick?: (event: React.MouseEvent, index: number, file: FileEntry) => void;
  onRowDoubleClick?: (event: React.MouseEvent, index: number, file: FileEntry) => void;
}
const FileListCard: React.VFC<FileListCardProps> = ({ title, files, ...rest }) => {
  const content = (
    <>
      {title && (
        <Typography
          variant="h5"
          component="div"
          className="border-b border-solid border-current"
          gutterBottom
        >
          {title}
        </Typography>
      )}
      <div className="flex flex-1 overflow-hidden">
        {files && <FileList files={files} {...rest} />}
      </div>
    </>
  );
  return <FlexCard content={content} />;
};

export default memo(FileListCard);
