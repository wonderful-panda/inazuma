import classNames from "classnames";
import { GraphFragment } from "@/grapher";
import { shortHash } from "@/util";
import { Typography } from "@material-ui/core";
import { memo } from "react";
import GraphCell from "./GraphCell";
import RefBadge from "./RefBadge";
import { formatDateLLL } from "@/date";

export interface CommitListRowProps {
  height: number;
  commit: Commit;
  refs: Ref[];
  graph: GraphFragment;
  head: boolean;
  selected: boolean;
  parentId: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const CommitListRow: React.VFC<CommitListRowProps> = ({
  height,
  commit,
  graph,
  refs,
  head,
  selected,
  parentId,
  onClick: handleClick
}) => {
  const workingTree = commit.id === "--";
  return (
    <div
      className={classNames(
        "flex box-border cursor-pointer",
        "pl-4 border-b border-solid border-paper",
        "hover:bg-highlight",
        { "bg-highlight": selected }
      )}
      onClick={handleClick}
    >
      <GraphCell graph={graph} height={height} head={head} maskIdPrefix={parentId} />
      <div className="relative flex flex-col flex-nowrap flex-1 ml-6 overflow-hidden">
        <Typography
          variant="subtitle1"
          className="whitespace-nowrap overflow-hidden overflow-ellipsis"
        >
          {commit.summary}
        </Typography>
        <Typography variant="body2" className="text-greytext whitespace-nowrap">
          <span className="ml-2 whitespace-nowrap font-mono">{shortHash(commit.id)}</span>
          {!workingTree && (
            <>
              <span className="ml-3 whitespace-nowrap">by {commit.author},</span>
              <span className="ml-3 whitespace-nowrap">at {formatDateLLL(commit.date)}</span>
            </>
          )}
        </Typography>
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

export default memo(CommitListRow);
