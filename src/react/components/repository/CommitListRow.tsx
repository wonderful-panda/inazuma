import classNames from "classnames";
import { GraphFragment } from "@/grapher";
import { memo } from "react";
import GraphCell from "./GraphCell";
import RefBadge from "./RefBadge";
import { formatDateTimeLong } from "@/date";
import GitHash from "../GitHash";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { Icon } from "@iconify/react";

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
      <div className="relative my-auto flex-col-nowrap flex-1 ml-6 overflow-hidden">
        <div className="flex-row-nowrap items-center text-lg leading-6 whitespace-nowrap overflow-hidden overflow-ellipsis">
          {refs && refs.map((r) => <RefBadge key={`${r.type}:${r.fullname}`} r={r} />)}
          {commit.summary}
        </div>
        <div className="flex-row-nowrap leading-5 pl-1 text-greytext whitespace-nowrap">
          <GitHash hash={commit.id} />
          {!workingTree && (
            <>
              <span className="flex-row-nowrap whitespace-nowrap">
                <Icon className="ml-3 mr-0.5 my-auto" icon="mdi:account" />
                {commit.author}
                <Icon className="ml-3 mr-0.5 my-auto" icon="mdi:clock-outline" />
                {formatDateTimeLong(commit.date)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(CommitListRow);
