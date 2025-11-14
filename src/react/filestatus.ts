import type { IconName } from "./types/IconName";

export const FileStatusList = ["?", "!", "M", "A", "D", "R", "C", "T", "U"] as const;
export type FileStatus = (typeof FileStatusList)[number];

export const isValidFileStatus = (value: string): value is FileStatus =>
  (FileStatusList as unknown as string[]).includes(value);

export interface FileStatusAttr {
  icon: IconName;
  color: string;
  title: string;
}

const attrs: Record<FileStatus, FileStatusAttr> = {
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

export const getFileStatusAttr = (statusCode: string): FileStatusAttr => {
  const status = statusCode.substring(0, 1);
  return isValidFileStatus(status)
    ? attrs[status]
    : {
        icon: "octicon:diff-ignored-16",
        color: "red",
        title: `UNKNOWN STATUS CODE: ${statusCode}`
      };
};
