import classNames from "classnames";
import { IconButton, Typography } from "@material-ui/core";
import React, { memo, useMemo } from "react";
import FileStatusIcon from "./FileStatusIcon";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { Icon } from "../Icon";
import { FileCommand } from "@/commands/types";
import { executeFileCommand } from "@/commands";
import { useDispatch } from "react-redux";

export interface FileListRowProps {
  commit: DagNode;
  file: FileEntry;
  index: number;
  height: number;
  actions?: readonly FileCommand[];
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

const Actions: React.VFC<{
  commit: DagNode;
  file: FileEntry;
  size: number;
  actions?: readonly FileCommand[];
}> = ({ commit, file, size, actions }) => {
  const dispatch = useDispatch();
  const buttons = useMemo(
    () =>
      (actions || [])
        .filter((a) => a.icon && !a.hidden?.(commit, file, file.path))
        .map((a) => {
          const disabled = !!a.disabled?.(commit, file, file.path);
          const handleClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            executeFileCommand(a, dispatch, commit, file);
          };
          return (
            <IconButton
              key={a.id}
              className="p-1 mt-auto bg-paper hover:bg-highlight"
              style={{ minWidth: size, minHeight: size }}
              disabled={disabled}
              title={a.label}
              onClick={handleClick}
            >
              <Icon icon={a.icon!} />
            </IconButton>
          );
        }),
    [dispatch, commit, file, size, actions]
  );
  if (!actions) {
    return <></>;
  }
  return (
    <div className="absolute top-0 bottom-0 right-0 mr-1 flex-row-nowrap items-center opacity-0 group-hover:opacity-100">
      {buttons}
    </div>
  );
};

const FileListRow: React.VFC<FileListRowProps> = ({ commit, file, index, height, actions }) => {
  const selectedIndex = useSelectedIndex();
  return (
    <div
      className={classNames(
        "group relative flex overflow-hidden box-border cursor-pointer py-1",
        "border-b border-solid border-highlight",
        index === selectedIndex ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
      style={{ height }}
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
      <Actions commit={commit} file={file} size={height * 0.75} actions={actions} />
    </div>
  );
};

export default memo(FileListRow);
