import { vname } from "@/cssvar";
import { formatDateLLL } from "@/date";
import { GraphFragment } from "@/grapher";
import { shortHash } from "@/util";
import { makeStyles, Typography } from "@material-ui/core";
import { memo } from "react";
import styled from "styled-components";
import GraphCell from "./GraphCell";
import RefBadge from "./RefBadge";

export interface CommitListRowProps {
  height: number;
  commit: Commit;
  refs: Ref[];
  graph: GraphFragment;
  head: boolean;
  selected: boolean;
  parentId: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const Container = styled.div<{ $selected: boolean }>`
  display: flex;
  box-sizing: border-box;
  cursor: pointer;
  padding-left: 1rem;
  border-bottom: 1px solid #333;
  background-color: ${(p) => (p.$selected ? "#ffffff10" : undefined)};
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

const useStyles = makeStyles({
  firstLine: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  secondLine: {
    color: "#aaa",
    whiteSpace: "nowrap"
  }
});

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

const CommitListRow: React.VFC<CommitListRowProps> = ({
  height,
  commit,
  graph,
  refs,
  head,
  selected,
  parentId,
  onClick: handleClick
}) => {
  const styles = useStyles();
  const workingTree = commit.id === "--";
  return (
    <Container $selected={selected} onClick={handleClick}>
      <GraphCell graph={graph} height={height} head={head} maskIdPrefix={parentId} />
      <Attributes>
        <Typography className={styles.firstLine} variant="subtitle1">
          {commit.summary}
        </Typography>
        <Typography className={styles.secondLine} variant="body2">
          <CommitId>{shortHash(commit.id)}</CommitId>
          {!workingTree && <Author>{commit.author}</Author>}
          {!workingTree && <Date>{formatDateLLL(commit.date)}</Date>}
        </Typography>
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

export default memo(CommitListRow);
