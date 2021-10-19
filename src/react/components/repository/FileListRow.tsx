import classNames from "classnames";
import { Typography } from "@material-ui/core";
import { memo } from "react";
import FileStatusIcon from "./FileStatusIcon";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";

export const ROW_HEIGHT = 48;
const ROW_HEIGHT_CLASS = "h-[48px]";

export interface FileListRowProps {
  file: FileEntry;
  index: number;
}

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

const FileType: React.VFC<{ file: FileEntry }> = ({ file }) => (
  <div className="font-bold px-0.5 text-greytext mx-1 my-auto uppercase">{getFileType(file)}</div>
);

const NumStat: React.VFC<{ file: FileEntry }> = ({ file }) => (
  <>
    {isNumberStat(file.insertions) && (
      <div className="mx-1 my-auto text-[lightgreen]">+{file.insertions}</div>
    )}
    {isNumberStat(file.deletions) && (
      <div className="mx-1 my-auto text-[hotpink]">-{file.deletions}</div>
    )}
  </>
);

const OldPath: React.VFC<{ file: FileEntry }> = ({ file }) =>
  file.oldPath ? (
    <>
      <div className="font-bold leading-4 mx-1 my-auto px-0.5 py-0 text-background bg-greytext">
        {file.statusCode.startsWith("R") ? "Rename from" : "Copy from"}
      </div>
      <div className="flex-1 font-bold overflow-hidden whitespace-nowrap overflow-ellipsis text-greytext">
        {file.oldPath}
      </div>
    </>
  ) : (
    <></>
  );

const FileListRow: React.VFC<FileListRowProps> = ({ file, index }) => {
  const selectedIndex = useSelectedIndex();
  return (
    <div
      className={classNames(
        "flex overflow-hidden box-border cursor-pointer py-1",
        ROW_HEIGHT_CLASS,
        "border-b border-solid border-highlight",
        index === selectedIndex ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
    >
      <div className="mx-2 my-auto">
        <FileStatusIcon statusCode={file.statusCode} />
      </div>
      <div className="flex-1 flex-col-nowrap pl-1 overflow-hidden font-mono">
        <Typography
          variant="subtitle1"
          component="div"
          className="whitespace-nowrap overflow-hidden overflow-ellipsis h-6 leading-6"
        >
          {file.path}
        </Typography>
        <Typography
          variant="body2"
          component="div"
          className="flex-row-nowrap whitespace-nowrap h-4 leading-4"
        >
          <FileType file={file} />
          <NumStat file={file} />
          <OldPath file={file} />
        </Typography>
      </div>
    </div>
  );
};

export default memo(FileListRow);
