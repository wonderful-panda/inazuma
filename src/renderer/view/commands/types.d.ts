import { AppStore } from "../store";

export interface CommitCommand {
  id: string;
  label: string;
  handler(commit: Commit): void;
  isVisible?(commit: Commit): boolean;
  isEnabled?(commit: Commit): boolean;
}

export interface FileCommand {
  id: string;
  label: string;
  icon?: string;
  handler(commit: Commit, file: FileEntry, path: string): void;
  isEnabled?(commit: Commit, file: FileEntry, path: string): boolean;
}
