import { vname } from "@/cssvar";
import { formatDateLLL } from "@/date";
import { GraphFragment } from "@/grapher";
import { shortHash } from "@/util";
import { Typography, withStyles } from "@material-ui/core";
import { memo } from "react";
import styled from "styled-components";
import GraphCell from "./GraphCell";
import RefBadge from "./RefBadge";

export interface CommitLogRowProps {
  height: number;
  commit: Commit;
  refs: Ref[];
  graph: GraphFragment;
  head: boolean;
}

const Container = styled.div`
  display: flex;
  box-sizing: border-box;
  cursor: pointer;
  padding-left: 1rem;
  border-bottom: 1px solid #333;
  :hover {
    background-color: #ffffff10;
  }
`;

const Attributes = styled.div`
  margin-left: 24px;
  flex: 1;
  display: flex;
  position: relative;
  flex-flow: column nowrap;
  overflow: hidden;
`;

const Badges = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 6px;
`;

const FirstLine = withStyles({
  root: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
})(Typography);

const SecondLine = withStyles({
  root: {
    color: "#aaa",
    whiteSpace: "nowrap"
  }
})(Typography);

const CommitId = styled.span`
  margin-left: 8px;
  white-space: nowrap;
  font-family: var(${vname("monospaceFontfamily")});
`;

const Author = styled.span`
  margin-left: 12px;
  white-space: nowrap;
  &::before {
    content: "by ";
  }
  &::after {
    content: ",";
  }
`;

const Date = styled.span`
  margin-left: 12px;
  white-space: nowrap;
  &::before {
    content: "at ";
  }
`;

const CommitLogRow: React.VFC<CommitLogRowProps> = ({ height, commit, graph, refs, head }) => {
  const workingTree = commit.id === "--";
  return (
    <Container>
      <GraphCell graph={graph} height={height} head={head} />
      <Attributes>
        <FirstLine variant="subtitle1">{commit.summary}</FirstLine>
        <SecondLine variant="body2">
          <CommitId>{shortHash(commit.id)}</CommitId>
          {!workingTree && <Author>{commit.author}</Author>}
          {!workingTree && <Date>{formatDateLLL(commit.date)}</Date>}
        </SecondLine>
      </Attributes>
      {refs && (
        <Badges>
          {refs.map((r) => (
            <RefBadge key={`${r.type}:${r.fullname}`} r={r} />
          ))}
        </Badges>
      )}
    </Container>
  );
};

export default memo(CommitLogRow);
