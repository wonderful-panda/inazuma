import { invokeTauriCommand } from "@/invokeTauriCommand";
import { SHOW_SUCCESS } from "@/store/misc";
import { shortHash } from "@/util";
import { CommitCommand } from "./types";
import { useMemo } from "react";
import { useDispatch } from "@/store";

export const useCopyFullHashCommand = () => {
  const dispatch = useDispatch();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "CopyFullHash",
      label: "Copy full hash",
      hidden: (commit) => commit.id === "--",
      handler: async (commit) => {
        await invokeTauriCommand("yank_text", { text: commit.id });
        dispatch(SHOW_SUCCESS(`Copied: ${commit.id}`));
      }
    }),
    [dispatch]
  );
};

export const useCopyShortHashCommand = () => {
  const dispatch = useDispatch();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "CopyShortHash",
      label: "Copy short hash",
      hidden: (commit) => commit.id === "--",
      handler: async (commit) => {
        const text = shortHash(commit.id);
        await invokeTauriCommand("yank_text", { text });
        dispatch(SHOW_SUCCESS(`Copied: ${text}`));
      }
    }),
    [dispatch]
  );
};
