import { useBeginReset } from "@/hooks/actions/reset";
import type { CommitCommand } from "./types";
import { useMemo } from "react";

export const useResetCommand = () => {
  const beginReset = useBeginReset();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "Reset",
      label: "Reset to this commit",
      icon: "mdi:arrow-left-top",
      hidden: (commit) => commit.id === "--",
      handler: async (commit) => beginReset(commit)
    }),
    [beginReset]
  );
};
