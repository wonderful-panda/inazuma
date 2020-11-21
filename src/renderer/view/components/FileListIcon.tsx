import { Octicon, IconNames } from "./Octicon";
import { css } from "@emotion/css";

const diffIconStyle = css`
  margin: auto 4px auto 8px;
`;

const attrs: Record<string, { icon: IconNames; color: string; title: string }> = {
  M: { icon: "diff-modified", color: "orange", title: "modified" },
  T: { icon: "diff-modified", color: "orange", title: "type changed" },
  R: { icon: "diff-renamed", color: "cyan", title: "renamed" },
  A: { icon: "diff-added", color: "lightgreen", title: "added" },
  "?": { icon: "diff-added", color: "gray", title: "unknown" },
  C: { icon: "diff-added", color: "lightgreen", title: "copied" },
  D: { icon: "diff-removed", color: "hotpink", title: "removed" },
  U: { icon: "diff-modified", color: "red", title: "conflicted" }
};

export const FileListIcon = _fc<{ statusCode: string }>(({ props: { statusCode } }) => {
  const attr = attrs[statusCode[0]] || {
    icon: "diff-ignored",
    color: "red",
    title: "UNKNOWN STATUS CODE: " + statusCode
  };
  return <Octicon class={diffIconStyle} name={attr.icon} color={attr.color} title={attr.title} />;
});
