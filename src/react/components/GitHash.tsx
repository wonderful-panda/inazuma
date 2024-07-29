import { shortHash } from "@/util";
import classNames from "classnames";

export const GitHash: React.FC<{ hash: string; full?: boolean; className?: string }> = ({
  hash,
  full,
  className
}) => (
  <div className={classNames("whitespace-nowrap font-mono", className)} title={hash}>
    {full ? hash : shortHash(hash)}
  </div>
);
