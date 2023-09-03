import { SHOW_LSTREE } from "@/store/thunk/showLsTree";
import { CommitCommand } from "./types";
import { useMemo } from "react";
import { useDispatch } from "@/store";

export const useBrowseSourceTreeCommand = () => {
  const dispatch = useDispatch();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "BrowseSourceTree",
      label: "Browse source tree",
      icon: "mdi:file-tree",
      hidden: (commit) => commit.id === "--",
      handler: async (commit) => {
        dispatch(SHOW_LSTREE(commit));
      }
    }),
    [dispatch]
  );
};
