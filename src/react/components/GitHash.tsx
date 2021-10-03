import { shortHash } from "@/util";

const GitHash: React.VFC<{ hash: string }> = ({ hash }) => (
  <div className="whitespace-nowrap font-mono" title={hash}>
    {shortHash(hash)}
  </div>
);

export default GitHash;
