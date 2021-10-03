import { Typography } from "@material-ui/core";
import { memo } from "react";
import FlexCard from "../FlexCard";
import FileList from "./FileList";

export interface FileListCardProps {
  title?: string;
  files?: FileEntry[];
}
const FileListCard: React.VFC<FileListCardProps> = ({ title, files }) => {
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
      <div className="flex flex-1 overflow-hidden">{files && <FileList files={files} />}</div>
    </>
  );
  return <FlexCard content={content} />;
};

export default memo(FileListCard);
