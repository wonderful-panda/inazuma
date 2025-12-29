import classNames from "classnames";
import { shortHash } from "@/util";

export const GitHash: React.FC<{ hash: string; full?: boolean; className?: string }> = ({
  hash,
  full,
  className
}) => (
  <div className={classNames("whitespace-nowrap font-mono", className)} title={hash}>
    {full ? hash : shortHash(hash)}
  </div>
);
