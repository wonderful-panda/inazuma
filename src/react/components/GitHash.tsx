import { vname } from "@/cssvar";
import { shortHash } from "@/util";
import styled from "styled-components";

const Div = styled.div`
  white-space: nowrap;
  font-family: var(${vname("monospaceFontfamily")});
`;
const GitHash: React.VFC<{ hash: string; className?: string }> = ({ hash, className }) => (
  <Div title={hash} className={className}>
    {shortHash(hash)}
  </Div>
);

export default GitHash;
