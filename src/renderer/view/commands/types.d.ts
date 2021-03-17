import { MaterialIconNames } from "view/components/base/VMaterialIcon";

export interface CommitCommand {
  id: string;
  label: string;
  handler(commit: DagNode): void;
  hidden?(commit: DagNode): boolean;
  disabled?(commit: DagNode): boolean;
}

export interface FileCommand {
  id: string;
  label: string;
  icon?: MaterialIconNames;
  handler(commit: DagNode, file: FileEntry, path: string): void;
  disabled?(commit: DagNode, file: FileEntry, path: string): boolean;
}
