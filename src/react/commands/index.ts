import { Dispatch } from "@/store";
import { diffStaged, diffUnstaged, diffWithLocal, diffWithParent } from "./diff";
import { showFileContent } from "./showFileContent";
import { stage, unstage } from "./staging";
import { FileCommand } from "./types";

export const fileCommands = [
  stage,
  unstage,
  diffWithParent,
  diffWithLocal,
  diffStaged,
  diffUnstaged,
  showFileContent
];

export const executeFileCommand = (
  command: FileCommand,
  dispatch: Dispatch,
  commit: DagNode,
  file: FileEntry,
  path?: string
) => {
  const realPath = path || file.path;
  if (command.hidden?.(commit, file, realPath) || command.disabled?.(commit, file, realPath)) {
    return false;
  }
  command.handler(dispatch, commit, file, realPath);
  return true;
};
