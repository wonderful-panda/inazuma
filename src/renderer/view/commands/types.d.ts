import { AppStore } from "../store";

export interface CommitCommand {
  id: string;
  label: string;
  handler(store: AppStore, commit: Commit): void;
  isVisible?(commit: Commit): boolean;
  isEnabled?(commit: Commit): boolean;
}

export interface FileCommand {
  id: string;
  label: string;
  handler(store: AppStore, commit: Commit, file: FileEntry, path: string): void;
  isVisible?(commit: Commit, file: FileEntry, path: string): boolean;
  isEnabled?(commit: Commit, file: FileEntry, path: string): boolean;
}
