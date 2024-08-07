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
import { Avatar } from "./Avatar";
import { useConfigValue } from "@/state/root";
import { nope } from "@/util";

export const PinnedCommitContext = createContext<Commit | undefined>(undefined);

export const SetPinnedCommitContext = createContext<SetState<Commit | undefined>>(() => nope);

export interface CommitListRowProps {
  height: number;
  commit: Commit;
  refs: Ref[] | undefined;
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
  const config = useConfigValue();
  const selected = selectedIndex === index;
  const pinned = pinnedCommit?.id === commit.id;
  const workingTree = commit.id === "--";
  const actions = useMemo(() => {
    const ret = commitCommandsToActions(actionCommands, commit).filter(
      (a) => a.icon
    ) as RowActionItem[];
    if (!workingTree) {
      ret.push(setCompareBaseAction(commit, pinned, setPinnedCommit));
    }
    return ret;
  }, [actionCommands, commit, pinned, setPinnedCommit, workingTree]);
  return (
    <div
      className={classNames(
        "flex h-full box-border cursor-pointer overflow-hidden group",
        "pl-4 border-b border-paper",
        selected ? "bg-highlight" : "hover:bg-hoverHighlight"
      )}
    >
      <GraphCell graph={graph} height={height} head={head} maskIdPrefix={parentId} />
      <div className="my-auto ml-6 py-2 h-full w-10">
        <Avatar
          mailAddress={commit.mailAddress}
          shape={config.avatarShape}
          fromGravatar={config.useGravatar}
        />
      </div>
      <div className="relative my-auto flex-col-nowrap flex-1 ml-2 overflow-hidden">
        <div className="flex-row-nowrap items-center text-lg leading-6">
          {refs?.map((r) => <RefBadge key={`${r.type}:${r.fullname}`} r={r} />)}
          <span className={classNames("ellipsis", pinned && "text-secondary")}>
            {commit.summary}
          </span>
        </div>
        <div className="flex-row-nowrap leading-5 text-greytext whitespace-nowrap">
          {workingTree ? (
            <>
              <Icon className="ml-3 mr-0.5 my-auto" icon="mdi:account" />
              {commit.author}
            </>
          ) : (
            <>
              <Icon className="ml-3 mr-0.5 my-auto" icon="mdi:hashtag-box" />
              <GitHash hash={workingTree ? "-------" : commit.id} />
              <Icon className="ml-3 mr-0.5 my-auto" icon="mdi:account" />
              {commit.author}
              <Icon className="ml-3 mr-0.5 my-auto" icon="mdi:clock-outline" />
              {formatDateTimeLong(commit.date)}
            </>
          )}
        </div>
      </div>
      <RowActionButtons actions={actions} size={height * 0.7} />
    </div>
  );
};

export const CommitListRow = memo(CommitListRow_);
