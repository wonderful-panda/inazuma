import classNames from "classnames";
import { GraphFragment } from "@/grapher";
import { memo, useMemo } from "react";
import { GraphCell } from "./GraphCell";
import { RefBadge } from "./RefBadge";
import { formatDateTimeLong } from "@/date";
import { GitHash } from "../GitHash";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { Icon } from "@iconify/react";
import { CommitCommand, IconActionItem } from "@/commands/types";
import { RowActionButtons } from "./RowActionButtons";
import { commitCommandsToActions } from "@/commands";
import { useDispatch } from "@/store";

export interface CommitListRowProps {
  height: number;
  commit: Commit;
  refs: Ref[];
  graph: GraphFragment;
  head: boolean;
  index: number;
  parentId: string;
  actionCommands?: readonly CommitCommand[];
}

const CommitListRow_: React.VFC<CommitListRowProps> = ({
  height,
  commit,
  graph,
  refs,
  head,
  index,
  parentId,
  actionCommands
}) => {
  const selectedIndex = useSelectedIndex();
  const workingTree = commit.id === "--";
  const dispatch = useDispatch();
  const actions = useMemo(
    () =>
      commitCommandsToActions(dispatch, actionCommands, commit).filter(
        (a) => a.icon
      ) as IconActionItem[],
    [dispatch, actionCommands, commit]
  );
  return (
    <div
      className={classNames(
        "flex box-border cursor-pointer overflow-hidden group",
        "pl-4 border-b border-solid border-paper",
        index === selectedIndex ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
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
      <RowActionButtons actions={actions} size={height * 0.6} />
    </div>
  );
};

export const CommitListRow = memo(CommitListRow_);
