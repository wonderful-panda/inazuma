import classNames from "classnames";
import { useAtom } from "jotai";
import { memo, useMemo } from "react";
import { useAlert } from "@/core/context/AlertContext";
import { useConfigValue } from "@/core/state/root";
import { commitCommandsToActions } from "@/features/repository/commands";
import type { CommitCommand } from "@/features/repository/commands/types";
import { useShowCommitDiff } from "@/features/repository/hooks/showCommitDiff";
import { pinnedCommitAtom } from "@/features/repository/state/misc";
import type { GraphFragment } from "@/features/repository/utils/grapher";
import { GitHash } from "@/shared/components/ui/GitHash";
import { Icon } from "@/shared/components/ui/Icon";
import { useSelectedIndex } from "@/shared/hooks/ui/useSelectedIndex";
import { useWithRef } from "@/shared/hooks/utils/useWithRef";
import { formatDateTimeLong } from "@/shared/utils/date";
import { Avatar } from "./Avatar";
import { GraphCell } from "./GraphCell";
import { RefBadge } from "./RefBadge";
import { RowActionButtons, type RowActionItem } from "./RowActionButtons";

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
  setPinnedCommitId: (value: Commit | undefined) => void
): RowActionItem => ({
  id: "SetCompareBase",
  icon: "mdi:map-marker",
  label: "Set pin to this commit. (mark this commit as Compare-BASE)",
  alwaysVisible: pinned,
  className: pinned ? "text-secondary" : undefined,
  handler: () => {
    if (pinned) {
      setPinnedCommitId(undefined);
    } else {
      setPinnedCommitId(commit);
    }
  }
});

export const useCompareWithPinnedCommitAction = (
  commit: Commit,
  pinned: boolean,
  pinnedCommit: Commit | undefined
): RowActionItem => {
  const [, showCommitDiff] = useWithRef(useShowCommitDiff());
  const [, pinnedCommitRef] = useWithRef(pinnedCommit);
  const { showWarning } = useAlert();
  return useMemo<RowActionItem>(
    () => ({
      id: "CompareCommitWithPinnedCommit",
      label: "Compare with pinned commit (Compare-BASE commit)",
      icon: "mdi:map-marker-distance",
      hidden: () => commit.id === "--",
      disabled: pinned,
      handler: () => {
        if (!pinnedCommitRef.current) {
          showWarning("No commit is pinned");
          return;
        }
        void showCommitDiff.current(pinnedCommitRef.current, commit);
      }
    }),
    [commit, pinned, showWarning]
  );
};

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
  const [pinnedCommit, setPinnedCommit] = useAtom(pinnedCommitAtom);
  const config = useConfigValue();
  const selected = selectedIndex === index;
  const pinned = pinnedCommit?.id === commit.id;
  const workingTree = commit.id === "--";
  const compareWithPinnedCommit = useCompareWithPinnedCommitAction(commit, pinned, pinnedCommit);
  const actions = useMemo(() => {
    const ret = commitCommandsToActions(actionCommands, commit).filter(
      (a) => a.icon
    ) as RowActionItem[];
    if (!workingTree) {
      ret.push(compareWithPinnedCommit);
      ret.push(setCompareBaseAction(commit, pinned, setPinnedCommit));
    }
    return ret;
  }, [actionCommands, commit, pinned, setPinnedCommit, workingTree, compareWithPinnedCommit]);
  return (
    <div
      className={classNames(
        "flex h-full box-border cursor-pointer overflow-hidden group",
        "pl-4 border-b border-paper",
        selected ? "bg-highlight" : "hover:bg-hover-highlight"
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
          {refs?.map((r) => (
            <RefBadge key={`${r.type}:${r.fullname}`} r={r} />
          ))}
          <span className={classNames("ellipsis", pinned && "text-secondary")}>
            {commit.summary}
          </span>
        </div>
        <div className="flex-row-nowrap leading-5 text-greytext whitespace-nowrap">
          {workingTree ? (
            <>
              <Icon className="ml-3 mr-0.5 my-auto flex-none" icon="mdi:account" />
              {commit.author}
            </>
          ) : (
            <>
              <Icon className="ml-3 mr-0.5 my-auto flex-none" icon="mdi:hashtag-box" />
              <GitHash hash={workingTree ? "-------" : commit.id} />
              <Icon className="ml-3 mr-0.5 my-auto flex-none" icon="mdi:account" />
              {commit.author}
              <Icon className="ml-3 mr-0.5 my-auto flex-none" icon="mdi:clock-outline" />
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
