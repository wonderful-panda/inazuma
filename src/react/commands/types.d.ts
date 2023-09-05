import { IconName } from "@/types/IconName";

export interface CommitCommand {
  type: "commit";
  id: string;
  label: string;
  icon?: IconName;
  handler(commit: Commit): void;
  hidden?(commit: Commit): boolean;
  disabled?(commit: Commit): boolean;
}

export interface FileCommand {
  type: "file";
  id: string;
  label: string;
  icon?: IconName;
  handler(commit: Commit, file: FileEntry, localPath: string): void;
  hidden?(commit: Commit, file: FileEntry): boolean;
  disabled?(commit: Commit, file: FileEntry): boolean;
}

export interface ActionItem {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  handler: () => void;
}
export type IconActionItem = ActionItem & { icon: IconName };
