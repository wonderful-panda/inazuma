import { MaterialIconNames } from "view/components/base/VMaterialIcon";
import { AppStore } from "../store";

export interface CommitCommand {
  id: string;
  label: string;
  handler(commit: DagNode): void;
  isVisible?(commit: DagNode): boolean;
  isEnabled?(commit: DagNode): boolean;
}

export interface FileCommand {
  id: string;
  label: string;
  icon?: MaterialIconNames;
  handler(commit: DagNode, file: FileEntry, path: string): void;
  isEnabled?(commit: DagNode, file: FileEntry, path: string): boolean;
}
