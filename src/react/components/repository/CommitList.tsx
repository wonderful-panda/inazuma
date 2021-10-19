import { forwardRef, useCallback, useMemo } from "react";
import { GraphFragment } from "@/grapher";
import CommitListRow from "./CommitListRow";
import VirtualList, { VirtualListMethods } from "../VirtualList";

const ROW_HEIGHT = 52;

export interface CommitListProps {
  commits: Commit[];
  refs: Refs;
  graph: Record<string, GraphFragment>;
  onRowClick?: (event: React.MouseEvent, index: number, item: Commit) => void;
}

let nextId = 0;

const CommitList = forwardRef<VirtualListMethods, CommitListProps>(
  ({ commits, graph, refs, onRowClick }, ref) => {
    const instanceId = useMemo(() => (nextId++).toString(), []);
    const getItemKey = useCallback((item: Commit) => item.id, []);
    const renderRow = useCallback(
      ({ index, item }: { index: number; item: Commit }) => {
        return (
          <CommitListRow
            commit={item}
            index={index}
            head={item.id === refs.head}
            graph={graph[item.id]}
            refs={refs.refsById[item.id]}
            height={ROW_HEIGHT}
            parentId={instanceId}
          />
        );
      },
      [commits, graph, refs]
    );
    return (
      <VirtualList<Commit>
        ref={ref}
        items={commits}
        itemSize={ROW_HEIGHT}
        getItemKey={getItemKey}
        onRowClick={onRowClick}
      >
        {renderRow}
      </VirtualList>
    );
  }
);

export default CommitList;
