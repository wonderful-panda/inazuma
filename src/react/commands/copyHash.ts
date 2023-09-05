import { invokeTauriCommand } from "@/invokeTauriCommand";
import { shortHash } from "@/util";
import { CommitCommand } from "./types";
import { useMemo } from "react";
import { useShowSuccess } from "@/state/root";

export const useCopyFullHashCommand = () => {
  const showSuccess = useShowSuccess();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "CopyFullHash",
      label: "Copy full hash",
      hidden: (commit) => commit.id === "--",
      handler: async (commit) => {
        await invokeTauriCommand("yank_text", { text: commit.id });
        showSuccess(`Copied: ${commit.id}`);
      }
    }),
    [showSuccess]
  );
};

export const useCopyShortHashCommand = () => {
  const showSuccess = useShowSuccess();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "CopyShortHash",
      label: "Copy short hash",
      hidden: (commit) => commit.id === "--",
      handler: async (commit) => {
        const text = shortHash(commit.id);
        await invokeTauriCommand("yank_text", { text });
        showSuccess(`Copied: ${text}`);
      }
    }),
    [showSuccess]
  );
};
