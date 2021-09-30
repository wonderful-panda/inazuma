import {
  DiffAddedIcon,
  DiffModifiedIcon,
  DiffRemovedIcon,
  DiffRenamedIcon,
  DiffIgnoredIcon,
  OcticonProps
} from "@primer/octicons-react";

type Attr = {
  icon: React.VFC<OcticonProps>;
  color: string;
  title: string;
};

const attrs: Record<string, Attr> = {
  M: { icon: DiffModifiedIcon, color: "orange", title: "modified" },
  T: { icon: DiffModifiedIcon, color: "orange", title: "type changed" },
  R: { icon: DiffRenamedIcon, color: "cyan", title: "renamed" },
  A: { icon: DiffAddedIcon, color: "lightgreen", title: "added" },
  "?": { icon: DiffAddedIcon, color: "gray", title: "unknown" },
  C: { icon: DiffAddedIcon, color: "lightgreen", title: "copied" },
  D: { icon: DiffRemovedIcon, color: "hotpink", title: "removed" },
  U: { icon: DiffModifiedIcon, color: "red", title: "conflicted" }
};

const getAttr = (statusCode: string): Attr =>
  attrs[statusCode.substr(0, 1)] || {
    icon: DiffIgnoredIcon,
    color: "red",
    title: `UNKNOWN STATUS CODE: ${statusCode}`
  };

export interface FileStatusIconProps {
  statusCode: string;
}
const FileStatusIcon: React.VFC<FileStatusIconProps> = ({ statusCode }) => {
  const attr = getAttr(statusCode);
  const Icon = attr.icon;
  return (
    <span style={{ color: attr.color }} title={attr.title}>
      <Icon size="small" verticalAlign="unset" />
    </span>
  );
};

export default FileStatusIcon;
