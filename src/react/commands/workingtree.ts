import { RESTORE, STAGE, UNSTAGE } from "@/store/thunk/workingtree";
import { FileCommand } from "./types";
import { useMemo } from "react";

export const useStageCommand = () =>
  useMemo<FileCommand>(
    () => ({
      type: "file",
      id: "Stage",
      label: "Stage selected file",
      icon: "mdi:plus",
      hidden: (commit, file) => {
        return commit.id !== "--" || file.kind?.type === "staged";
      },
      handler(dispatch, _, file) {
        dispatch(STAGE(file.path));
      }
    }),
    []
  );

export const useUnstageCommand = () =>
  useMemo<FileCommand>(
    () => ({
      type: "file",
      id: "Unstage",
      label: "Unstage selected file",
      icon: "mdi:minus",
      hidden: (commit, file) => {
        return commit.id !== "--" || file.kind?.type !== "staged";
      },
      handler(dispatch, _, file) {
        dispatch(UNSTAGE(file.path));
      }
    }),
    []
  );

export const useRestoreCommand = () =>
  useMemo<FileCommand>(
    () => ({
      type: "file",
      id: "Restore",
      label: "Restore(discard unstaged changes)",
      icon: "mdi:undo",
      hidden: (commit, file) => {
        return commit.id !== "--" || file.kind?.type !== "unstaged" || file.statusCode === "?";
      },
      handler(dispatch, _, file) {
        dispatch(RESTORE(file.path));
      }
    }),
    []
  );
