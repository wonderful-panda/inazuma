import { AutoSizer, List } from "react-virtualized";
import { useCallback } from "react";
import { GraphFragment } from "@/grapher";
import CommitLogRow from "./CommitLogRow";

const ROW_HEIGHT = 52;

export interface CommitLogProps {
  commits: Commit[];
  refs: Refs;
  graph: Record<string, GraphFragment>;
}

const CommitLog: React.VFC<CommitLogProps> = ({ commits, graph, refs }) => {
  const renderRow = useCallback(
    ({ index, key, style }: { index: number; key: string; style: object }) => {
      const commit = commits[index];
      return (
        <div key={key} style={style}>
          <CommitLogRow
            commit={commit}
            head={commit.id === refs.head}
            graph={graph[commit.id]}
            refs={refs.refsById[commit.id]}
            height={ROW_HEIGHT}
          />
        </div>
      );
    },
    [commits, graph, refs]
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

export default CommitLog;
