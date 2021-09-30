import { AutoSizer, List } from "react-virtualized";
import { useCallback, useMemo } from "react";
import { GraphFragment } from "@/grapher";
import CommitListRow from "./CommitListRow";

const ROW_HEIGHT = 52;

export interface CommitListProps {
  commits: Commit[];
  refs: Refs;
  graph: Record<string, GraphFragment>;
  selectedIndex: number;
  onRowclick?: (event: React.MouseEvent, index: number, commit: Commit) => void;
}

let nextId = 0;

const CommitList: React.VFC<CommitListProps> = ({
  commits,
  graph,
  refs,
  selectedIndex,
  onRowclick
}) => {
  const instanceId = useMemo(() => (nextId++).toString(), []);
  const renderRow = useCallback(
    ({ index, key, style }: { index: number; key: string; style: object }) => {
      const commit = commits[index];
      const handleClick = onRowclick && ((e: React.MouseEvent) => onRowclick(e, index, commit));
      return (
        <div key={key} style={style}>
          <CommitListRow
            commit={commit}
            selected={index === selectedIndex}
            head={commit.id === refs.head}
            graph={graph[commit.id]}
            refs={refs.refsById[commit.id]}
            height={ROW_HEIGHT}
            parentId={instanceId}
            onClick={handleClick}
          />
        </div>
      );
    },
    [commits, graph, refs, selectedIndex, onRowclick]
  );
  return (
    <AutoSizer style={{ flex: 1 }}>
      {({ width, height }) => (
        <List
          width={width}
          height={height}
          overscanRowCount={8}
          rowCount={commits.length}
          rowHeight={ROW_HEIGHT}
          rowRenderer={renderRow}
        />
      )}
    </AutoSizer>
  );
};

export default CommitList;
