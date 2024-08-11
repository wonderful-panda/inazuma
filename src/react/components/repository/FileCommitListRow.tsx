import classNames from "classnames";
import { memo } from "react";
import { RefBadge } from "./RefBadge";
import { formatDateTimeLong } from "@/date";
import { FileStatusIcon } from "./FileStatusIcon";
import { GitHash } from "../GitHash";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { FileStat } from "./FileStat";
import { Icon } from "../Icon";

export const getRowHeightClass = (commit: FileCommit) => (commit.oldPath ? "h-[76px]" : "h-[52px]");

export interface FileCommitListRowProps {
  commit: FileCommit;
  refs: Ref[] | undefined;
  head: boolean;
  index: number;
  height: number;
  onClick?: (event: React.MouseEvent) => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

const FilePaths: React.FC<{ file: FileEntry }> = ({ file }) =>
  file.oldPath ? (
    <div className="text-[0.9rem] font-mono flex-row-nowrap text-greytext whitespace-nowrap">
      <div className="mr-1 my-auto leading-4 font-bold px-0.5 py-0 text-background bg-greytext">
        {file.statusCode.startsWith("R") ? "Rename" : "Copy"}
      </div>
      <div className="flex-1 leading-5 ellipsis text-greytext">
        {file.oldPath}
        {" -> "}
        {file.path}
      </div>
    </div>
  ) : (
    <></>
  );

const FileCommitListRow_: React.FC<FileCommitListRowProps> = ({
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
        "border-b border-paper",
        index === selectedIndex ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
      style={{ height }}
      {...{ onClick, onContextMenu }}
    >
      <div className="mx-2 my-auto h-4 leading-4">
        <FileStatusIcon statusCode={commit.statusCode} />
      </div>
      <div className="relative flex flex-col flex-nowrap flex-1 ml-1 my-auto overflow-hidden">
        <div className="flex-row-nowrap items-center text-lg leading-6 ellipsis">
          {refs?.map((r) => <RefBadge key={`${r.type}:${r.fullname}`} r={r} />)}
          <span className="ellipsis">{commit.summary}</span>
        </div>
        <div className="flex-row-nowrap items-center leading-5 pl-2 text-greytext ellipsis">
          <FileStat className="text-base min-w-[6.5rem] mr-1" file={commit} />
          <GitHash hash={commit.id} />
          <Icon className="ml-3 mr-0.5 my-auto flex-shrink-0" icon="mdi:account" />
          {commit.author}
          <Icon className="ml-3 mr-0.5 my-auto flex-shrink-0" icon="mdi:clock-outline" />
          {formatDateTimeLong(commit.date)}
        </div>
        {commit.oldPath && (
          <div className="flex-row-nowrap leading-5 pl-2 text-greytext whitespace-nowrap">
            <FilePaths file={commit} />
          </div>
        )}
      </div>
    </div>
  );
};

export const FileCommitListRow = memo(FileCommitListRow_);
