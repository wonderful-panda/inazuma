import { vname } from "@/cssvar";
import { assertNever } from "@/util";
import styled, { css } from "styled-components";

const Base = styled.span`
  vertical-align: middle;
  height: 14px;
  line-height: 14px;
  font-size: 12px;
  margin: auto 4px auto 0;
  padding: 0 0.4em 0 0.4em;
  box-sizing: content-box;
  cursor: default;
  background-color: var(${vname("backgroundDefault")});
`;

const Branch = styled(Base)<{ current: boolean }>`
  ${(p) =>
    p.current
      ? css`
          border: 2px solid orange;
          color: orange;
        `
      : css`
          border: 1px solid cyan;
          color: cyan;
        `}
  border-radius: 1em;
  cursor: pointer;
`;

const Tag = styled(Base)`
  border: 1px solid cyan;
  color: cyan;
`;

const Remote = styled(Base)`
  border: 1px solid #888;
  color: #888;
  border-radius: 1em;
`;

const RefBadge: React.VFC<{ r: Ref }> = ({ r }) => {
  switch (r.type) {
    case "HEAD":
      return <></>;
    case "heads":
      return <Branch current={r.current}>{r.name}</Branch>;
    case "tags":
      return <Tag>{r.name}</Tag>;
    case "remotes":
      return <Remote>{`${r.remote}/${r.name}`}</Remote>;
    case "MERGE_HEAD":
      return <></>;
    default:
      return assertNever(r);
  }
};

export default RefBadge;
