import classNames from "classnames";
import { memo } from "react";
import RefBadge from "./RefBadge";
import { formatDateLLL } from "@/date";
import FileStatusIcon from "./FileStatusIcon";
import GitHash from "../GitHash";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";

export const getRowHeightClass = (commit: FileCommit) => (commit.oldPath ? "h-[76px]" : "h-[52px]");

export interface FileCommitListRowProps {
  commit: FileCommit;
  refs: Ref[];
  head: boolean;
  index: number;
  height: number;
  onClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

const FilePaths: React.VFC<{ file: FileEntry }> = ({ file }) =>
  file.oldPath ? (
    <div className="text-[0.9rem] font-mono flex-row-nowrap text-greytext whitespace-nowrap">
      <div className="mr-1 my-auto leading-4 font-bold px-0.5 py-0 text-background bg-greytext">
        {file.statusCode.startsWith("R") ? "Rename" : "Copy"}
      </div>
      <div className="flex-1 leading-5 overflow-hidden whitespace-nowrap overflow-ellipsis text-greytext">
        {file.oldPath}
        {" -> "}
        {file.path}
      </div>
    </div>
  ) : (
    <></>
  );

const FileCommitListRow: React.VFC<FileCommitListRowProps> = ({
  commit,
  refs,
  index,
  onClick,
  height,
  onContextMenu
}) => {
  const selectedIndex = useSelectedIndex();
  return (
    <div
      className={classNames(
        "flex box-border cursor-pointer py-1",
        "border-b border-solid border-paper",
        index === selectedIndex ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
      style={{ height }}
      {...{ onClick, onContextMenu }}
    >
      <div className="mx-2 my-auto h-4 leading-4">
        <FileStatusIcon statusCode={commit.statusCode} />
      </div>
      <div className="relative flex flex-col flex-nowrap flex-1 ml-1 my-auto overflow-hidden">
        <div className="text-lg leading-6 whitespace-nowrap overflow-hidden overflow-ellipsis">
          {commit.summary}
        </div>
        <div className="flex-row-nowrap leading-5 pl-2 text-greytext whitespace-nowrap">
          <GitHash hash={commit.id} />
          <span className="ml-3 whitespace-nowrap">by {commit.author},</span>
          <span className="mx-3 whitespace-nowrap">at {formatDateLLL(commit.date)}</span>
        </div>
        {commit.oldPath && (
          <div className="flex-row-nowrap leading-5 pl-2 text-greytext whitespace-nowrap">
            <FilePaths file={commit} />
          </div>
        )}
      </div>
      {refs && (
        <div className="absolute right-0 bottom-0 p-2">
          {refs.map((r) => (
            <RefBadge key={`${r.type}:${r.fullname}`} r={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(FileCommitListRow);
