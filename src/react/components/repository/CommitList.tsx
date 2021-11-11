import { useTheme } from "@material-ui/core";
import { forwardRef, useCallback, useMemo } from "react";
import { GraphFragment } from "@/grapher";
import CommitListRow from "./CommitListRow";
import VirtualList, { VirtualListEvents, VirtualListMethods } from "../VirtualList";

export interface CommitListProps extends VirtualListEvents<Commit> {
  commits: Commit[];
  refs: Refs;
  graph: Record<string, GraphFragment>;
}

const getCommitListKey = (item: Commit) => item.id;

let nextId = 0;

const CommitList: React.ForwardRefRenderFunction<VirtualListMethods, CommitListProps> = (
  { commits, graph, refs, ...rest },
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
        />
      );
    },
    [graph, refs, rowHeight, instanceId]
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

export default forwardRef(CommitList);
