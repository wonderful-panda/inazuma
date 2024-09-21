import type { IconName } from "@/types/IconName";
import { Icon } from "../Icon";
import { type FileStatus, isValidFileStatus } from "@/filestatus";

interface Attr {
  icon: IconName;
  color: string;
  title: string;
}

const attrs: Record<FileStatus, Attr> = {
  M: { icon: "octicon:diff-modified-16", color: "orange", title: "modified" },
  T: { icon: "octicon:diff-modified-16", color: "orange", title: "type changed" },
  R: { icon: "octicon:diff-renamed-16", color: "cyan", title: "renamed" },
  A: { icon: "octicon:diff-added-16", color: "lightgreen", title: "added" },
  "?": { icon: "octicon:diff-added-16", color: "gray", title: "unknown" },
  C: { icon: "octicon:diff-added-16", color: "lightgreen", title: "copied" },
  D: { icon: "octicon:diff-removed-16", color: "hotpink", title: "removed" },
  U: { icon: "octicon:diff-modified-16", color: "red", title: "conflicted" },
  "!": { icon: "octicon:diff-ignored-16", color: "gray", title: "ignored" }
};

const getAttr = (statusCode: string): Attr => {
  const status = statusCode.substring(0, 1);
  return isValidFileStatus(status)
    ? attrs[status]
    : {
        icon: "octicon:diff-ignored-16",
        color: "red",
        title: `UNKNOWN STATUS CODE: ${statusCode}`
      };
};

export interface FileStatusIconProps {
  statusCode: string;
}
export const FileStatusIcon: React.FC<FileStatusIconProps> = ({ statusCode }) => {
  const attr = getAttr(statusCode);
  return (
    <span style={{ color: attr.color, fontSize: "16px" }} title={attr.title}>
      <Icon icon={attr.icon} />
    </span>
  );
};
