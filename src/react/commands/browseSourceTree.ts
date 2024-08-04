import { useShowLsTree } from "@/hooks/actions/showLsTree";
import { CommitCommand } from "./types";
import { useMemo } from "react";

export const useBrowseSourceTreeCommand = () => {
  const showLsTree = useShowLsTree();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "BrowseSourceTree",
      label: "Browse source tree",
      icon: "mdi:file-tree",
      hidden: (commit) => commit.id === "--",
      handler: (commit) => {
        void showLsTree(commit);
      }
    }),
    [showLsTree]
  );
};
