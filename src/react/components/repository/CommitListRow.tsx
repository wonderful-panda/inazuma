import classNames from "classnames";
import { GraphFragment } from "@/grapher";
import { createContext, memo, useContext, useMemo } from "react";
import { GraphCell } from "./GraphCell";
import { RefBadge } from "./RefBadge";
import { formatDateTimeLong } from "@/date";
import { GitHash } from "../GitHash";
import { useSelectedIndex } from "@/hooks/useSelectedIndex";
import { Icon } from "@iconify/react";
import { CommitCommand } from "@/commands/types";
import { RowActionButtons, RowActionItem } from "./RowActionButtons";
import { commitCommandsToActions } from "@/commands";
import { useDispatch } from "@/store";

export const PinnedCommitContext = createContext<Commit | undefined>(undefined);

export const SetPinnedCommitContext = createContext<SetState<Commit | undefined>>(() => () => {});

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

const setCompareBaseAction = (
  commit: Commit,
  pinned: boolean,
  setPinnedCommit: SetState<Commit | undefined>
): RowActionItem => ({
  id: "SetCompareBase",
  icon: "mdi:map-marker",
  label: "Mark this commit as Compare-BASE",
  alwaysVisible: pinned,
  className: pinned ? "text-secondary" : undefined,
  handler: () => {
    if (pinned) {
      setPinnedCommit(undefined);
    } else {
      setPinnedCommit(commit);
    }
  }
});

const CommitListRow_: React.FC<CommitListRowProps> = ({
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
  const pinnedCommit = useContext(PinnedCommitContext);
  const setPinnedCommit = useContext(SetPinnedCommitContext);
  const selected = selectedIndex === index;
  const pinned = pinnedCommit?.id === commit.id;
  const workingTree = commit.id === "--";
  const dispatch = useDispatch();
  const actions = useMemo(() => {
    const ret = commitCommandsToActions(dispatch, actionCommands, commit).filter(
      (a) => a.icon
    ) as RowActionItem[];
    if (!workingTree) {
      ret.push(setCompareBaseAction(commit, pinned, setPinnedCommit));
    }
    return ret;
  }, [dispatch, actionCommands, commit, pinned, setPinnedCommit, workingTree]);
  return (
    <div
      className={classNames(
        "flex box-border cursor-pointer overflow-hidden group",
        "pl-4 border-b border-solid border-paper",
        selected ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
    >
      <GraphCell graph={graph} height={height} head={head} maskIdPrefix={parentId} />
      <div className="relative my-auto flex-col-nowrap flex-1 ml-6 overflow-hidden">
        <div className="flex-row-nowrap items-center text-lg leading-6">
          {refs && refs.map((r) => <RefBadge key={`${r.type}:${r.fullname}`} r={r} />)}
          <span className={classNames("ellipsis", pinned && "text-secondary")}>
            {commit.summary}
          </span>
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
      <RowActionButtons actions={actions} size={height * 0.7} />
    </div>
  );
};

export const CommitListRow = memo(CommitListRow_);
