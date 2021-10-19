import classNames from "classnames";
import { GraphFragment } from "@/grapher";
import { memo } from "react";
import GraphCell from "./GraphCell";
import RefBadge from "./RefBadge";
import { formatDateLLL } from "@/date";
import GitHash from "../GitHash";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";

export interface CommitListRowProps {
  height: number;
  commit: Commit;
  refs: Ref[];
  graph: GraphFragment;
  head: boolean;
  index: number;
  parentId: string;
  onClick?: (event: React.MouseEvent) => void;
}

const CommitListRow: React.VFC<CommitListRowProps> = ({
  height,
  commit,
  graph,
  refs,
  head,
  index,
  parentId,
  onClick
}) => {
  const selectedIndex = useSelectedIndex();
  const workingTree = commit.id === "--";
  return (
    <div
      className={classNames(
        "flex box-border cursor-pointer",
        "pl-4 border-b border-solid border-paper",
        index === selectedIndex ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
      onClick={onClick}
    >
      <GraphCell graph={graph} height={height} head={head} maskIdPrefix={parentId} />
      <div className="relative my-auto flex flex-col flex-nowrap flex-1 ml-6 overflow-hidden">
        <div className="text-lg leading-6 whitespace-nowrap overflow-hidden overflow-ellipsis">
          {commit.summary}
        </div>
        <div className="flex-row-nowrap leading-5 pl-1 text-greytext whitespace-nowrap">
          <GitHash hash={commit.id} />
          {!workingTree && (
            <>
              <span className="ml-3 whitespace-nowrap">by {commit.author},</span>
              <span className="ml-3 whitespace-nowrap">at {formatDateLLL(commit.date)}</span>
            </>
          )}
        </div>
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
