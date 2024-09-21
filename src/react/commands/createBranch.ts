import { useBeginCreateBranch } from "@/hooks/actions/branch";
import type { CommitCommand } from "./types";
import { useMemo } from "react";

export const useCreateBranchCommand = () => {
  const beginCreateBranch = useBeginCreateBranch();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "CreateBranch",
      label: "Create new branch",
      icon: "mdi:source-branch-plus",
      hidden: (commit) => commit.id === "--",
      handler: (commit) => {
        void beginCreateBranch(commit);
      }
    }),
    [beginCreateBranch]
  );
};
