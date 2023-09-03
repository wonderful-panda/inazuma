import { RESTORE, STAGE, UNSTAGE } from "@/store/thunk/workingtree";
import { FileCommand } from "./types";
import { useMemo } from "react";
import { useDispatch } from "@/store";

export const useStageCommand = () => {
  const dispatch = useDispatch();
  return useMemo<FileCommand>(
    () => ({
      type: "file",
      id: "Stage",
      label: "Stage selected file",
      icon: "mdi:plus",
      hidden: (commit, file) => {
        return commit.id !== "--" || file.kind?.type === "staged";
      },
      handler(_, file) {
        dispatch(STAGE(file.path));
      }
    }),
    [dispatch]
  );
};

export const useUnstageCommand = () => {
  const dispatch = useDispatch();
  return useMemo<FileCommand>(
    () => ({
      type: "file",
      id: "Unstage",
      label: "Unstage selected file",
      icon: "mdi:minus",
      hidden: (commit, file) => {
        return commit.id !== "--" || file.kind?.type !== "staged";
      },
      handler(_, file) {
        dispatch(UNSTAGE(file.path));
      }
    }),
    [dispatch]
  );
};

export const useRestoreCommand = () => {
  const dispatch = useDispatch();
  return useMemo<FileCommand>(
    () => ({
      type: "file",
      id: "Restore",
      label: "Restore(discard unstaged changes)",
      icon: "mdi:undo",
      hidden: (commit, file) => {
        return commit.id !== "--" || file.kind?.type !== "unstaged" || file.statusCode === "?";
      },
      handler(_, file) {
        dispatch(RESTORE(file.path));
      }
    }),
    [dispatch]
  );
};
