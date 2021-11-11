import { Dispatch } from "@/store";
import { IconName } from "@/types/IconName";

export interface CommitCommand {
  id: string;
  label: string;
  icon?: IconName;
  handler(dispatch: Dispatch, commit: DagNode): void;
  hidden?(commit: DagNode): boolean;
  disabled?(commit: DagNode): boolean;
}

export interface FileCommand {
  id: string;
  label: string;
  icon?: IconName;
  handler(dispatch: Dispatch, commit: DagNode, file: FileEntry, localPath: string): void;
  hidden?(commit: DagNode, file: FileEntry): boolean;
  disabled?(commit: DagNode, file: FileEntry): boolean;
}

export interface ActionItem {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  handler: () => void;
}
export type IconActionItem = ActionItem & { icon: IconName };
