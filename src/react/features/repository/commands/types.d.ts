import type { IconName } from "@/core/types/IconName";

// Re-export common action types from core
export type { ActionItem, IconActionItem, Spacer } from "@/core/types/actions";

// Repository-specific command types
export interface CommitCommand {
  type: "commit";
  id: string;
  label: string;
  icon?: IconName;
  handler(commit: Commit): unknown;
  hidden?(commit: Commit): boolean;
  disabled?(commit: Commit): boolean;
}

export interface FileCommand {
  type: "file";
  id: string;
  label: string;
  icon?: IconName;
  handler(commit: Commit, file: FileEntry, localPath: string): unknown;
  hidden?(commit: Commit, file: FileEntry): boolean;
  disabled?(commit: Commit, file: FileEntry): boolean;
}
