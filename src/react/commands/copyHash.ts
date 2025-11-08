import { useMemo } from "react";
import { useAlert } from "@/context/AlertContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { shortHash } from "@/util";
import type { CommitCommand } from "./types";

export const useCopyFullHashCommand = () => {
  const { showSuccess } = useAlert();
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
  const { showSuccess } = useAlert();
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
