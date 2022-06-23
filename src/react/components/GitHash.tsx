import { shortHash } from "@/util";
import classNames from "classnames";

export const GitHash: React.FC<{ hash: string; className?: string }> = ({ hash, className }) => (
  <div className={classNames("whitespace-nowrap font-mono", className)} title={hash}>
    {shortHash(hash)}
  </div>
);
