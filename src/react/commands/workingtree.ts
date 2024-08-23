import { useRestore, useStage, useUnstage } from "@/hooks/actions/workingtree";
import { FileCommand } from "./types";
import { useMemo } from "react";

export const useStageCommand = () => {
  const stage = useStage();
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
        void stage([file.path]);
      }
    }),
    [stage]
  );
};

export const useUnstageCommand = () => {
  const unstage = useUnstage();
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
        void unstage([file.path]);
      }
    }),
    [unstage]
  );
};

export const useRestoreCommand = () => {
  const restore = useRestore();
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
        void restore(file.path);
      }
    }),
    [restore]
  );
};
