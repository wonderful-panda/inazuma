import { Dispatch } from "@/store";
import { IconName } from "@/__IconName";

export interface CommitCommand {
  id: string;
  label: string;
  handler(dispatch: Dispatch, commit: DagNode): void;
  hidden?(repoPath: string, commit: DagNode): boolean;
  disabled?(repoPath: string, commit: DagNode): boolean;
}

export interface FileCommand {
  id: string;
  label: string;
  icon?: IconName;
  handler(dispatch: Dispatch, commit: DagNode, file: FileEntry, path: string): void;
  hidden?(commit: DagNode, file: FileEntry, path: string): boolean;
  disabled?(commit: DagNode, file: FileEntry, path: string): boolean;
}
