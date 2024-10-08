import classNames from "classnames";
import { Typography } from "@mui/material";
import { memo, useMemo } from "react";
import { FileStatusIcon } from "./FileStatusIcon";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import type { FileCommand, IconActionItem } from "@/commands/types";
import { fileCommandsToActions } from "@/commands";
import { RowActionButtons } from "./RowActionButtons";
import { FileStat } from "./FileStat";

export interface FileListRowProps {
  commit: Commit;
  file: FileEntry;
  index: number;
  height: number;
  actionCommands?: readonly FileCommand[];
}

const OldPath: React.FC<{ file: FileEntry }> = ({ file }) =>
  file.oldPath ? (
    <>
      <div className="font-bold leading-4 mx-1 my-auto px-0.5 py-0 text-background bg-greytext">
        {file.statusCode.startsWith("R") ? "Rename from" : "Copy from"}
      </div>
      <div className="flex-1 font-bold ellipsis text-greytext">{file.oldPath}</div>
    </>
  ) : (
    <></>
  );

const FileListRow_: React.FC<FileListRowProps> = ({
  commit,
  file,
  index,
  height,
  actionCommands
}) => {
  const selectedIndex = useSelectedIndex();
  const actions = useMemo(
    () =>
      fileCommandsToActions(actionCommands, commit, file).filter((a) => a.icon) as IconActionItem[],
    [actionCommands, commit, file]
  );
  return (
    <div
      className={classNames(
        "group relative flex flex-1 overflow-hidden box-border cursor-pointer py-1",
        "border-b border-highlight",
        index === selectedIndex ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
      style={{ height }}
    >
      <div className="mx-2 my-auto">
        <FileStatusIcon statusCode={file.statusCode} />
      </div>
      <div className="flex-1 flex-col-nowrap pl-1 overflow-hidden font-mono">
        <Typography variant="subtitle1" component="div" className="ellipsis h-6 leading-6">
          {file.path}
        </Typography>
        <Typography
          variant="body2"
          component="div"
          className="flex-row-nowrap whitespace-nowrap h-4 leading-4"
        >
          <FileStat file={file} />
          <OldPath file={file} />
        </Typography>
      </div>
      <RowActionButtons actions={actions} size={height * 0.7} />
    </div>
  );
};

export const FileListRow = memo(FileListRow_);
