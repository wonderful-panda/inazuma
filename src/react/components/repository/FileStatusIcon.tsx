import { getFileStatusAttr } from "@/filestatus";
import { Icon } from "../Icon";

export interface FileStatusIconProps {
  statusCode: string;
}
export const FileStatusIcon: React.FC<FileStatusIconProps> = ({ statusCode }) => {
  const attr = getFileStatusAttr(statusCode);
  return (
    <span style={{ color: attr.color, fontSize: "16px" }} title={attr.title}>
      <Icon icon={attr.icon} />
    </span>
  );
};
