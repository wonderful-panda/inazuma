import { useTheme } from "@mui/material";
import { forwardRef, useCallback, useMemo } from "react";
import { GraphFragment } from "@/grapher";
import { CommitListRow } from "./CommitListRow";
import { VirtualList, VirtualListEvents, VirtualListMethods } from "../VirtualList";
import { CommitCommand } from "@/commands/types";

export interface CommitListProps extends VirtualListEvents<Commit> {
  commits: Commit[];
  refs: Refs;
  graph: Record<string, GraphFragment>;
  actionCommands?: readonly CommitCommand[];
}

const getCommitListKey = (item: Commit) => item.id;

let nextId = 0;

const CommitList_: React.ForwardRefRenderFunction<VirtualListMethods, CommitListProps> = (
  { commits, graph, refs, actionCommands, ...rest },
  ref
) => {
  const theme = useTheme();
  const rowHeight = theme.custom.baseFontSize * 3.25;
  const instanceId = useMemo(() => (nextId++).toString(), []);
  const renderRow = useCallback(
    ({ index, item }: { index: number; item: Commit }) => {
      return (
        <CommitListRow
          commit={item}
          index={index}
          head={item.id === refs.head}
          graph={graph[item.id]}
          refs={refs.refsById[item.id]}
          height={rowHeight}
          parentId={instanceId}
          actionCommands={actionCommands}
        />
      );
    },
    [graph, refs, rowHeight, instanceId, actionCommands]
  );
  return (
    <VirtualList<Commit>
      ref={ref}
      items={commits}
      itemSize={rowHeight}
      getItemKey={getCommitListKey}
      {...rest}
    >
      {renderRow}
    </VirtualList>
  );
};

export const CommitList = forwardRef(CommitList_);
