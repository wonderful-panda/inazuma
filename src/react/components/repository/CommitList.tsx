import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { GraphFragment } from "@/grapher";
import CommitListRow from "./CommitListRow";
import VirtualList from "../VirtualList";

const ROW_HEIGHT = 52;

export interface CommitListProps {
  commits: Commit[];
  refs: Refs;
  graph: Record<string, GraphFragment>;
  selectedIndex: number;
  onUpdateSelectedIndex: Dispatch<SetStateAction<number>>;
  className?: string;
  onRowClick?: (event: React.MouseEvent, index: number, item: Commit) => void;
}

let nextId = 0;

const CommitList: React.VFC<CommitListProps> = ({
  commits,
  graph,
  refs,
  selectedIndex,
  onUpdateSelectedIndex,
  className,
  onRowClick
}) => {
  const instanceId = useMemo(() => (nextId++).toString(), []);
  const getItemKey = useCallback((item: Commit) => item.id, []);
  const renderRow = useCallback(
    ({ index, selectedIndex, item }: { index: number; selectedIndex: number; item: Commit }) => {
      return (
        <CommitListRow
          commit={item}
          selected={index === selectedIndex}
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
      items={commits}
      selectedIndex={selectedIndex}
      onUpdateSelectedIndex={onUpdateSelectedIndex}
      className={className}
      itemSize={ROW_HEIGHT}
      getItemKey={getItemKey}
      onRowClick={onRowClick}
    >
      {renderRow}
    </VirtualList>
  );
};

export default CommitList;
