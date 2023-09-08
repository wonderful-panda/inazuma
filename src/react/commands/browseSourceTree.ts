import { CommitCommand } from "./types";
import { useMemo } from "react";
import { useShowLsTree } from "@/state/repository/tabs";

export const useBrowseSourceTreeCommand = () => {
  const showLsTree = useShowLsTree();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "BrowseSourceTree",
      label: "Browse source tree",
      icon: "mdi:file-tree",
      hidden: (commit) => commit.id === "--",
      handler: async (commit) => {
        showLsTree(commit);
      }
    }),
    [showLsTree]
  );
};
