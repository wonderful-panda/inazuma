import { SHOW_LSTREE } from "@/store/thunk/showLsTree";
import { CommitCommand } from "./types";
import { useMemo } from "react";

export const useBrowseSourceTreeCommand = () =>
  useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "BrowseSourceTree",
      label: "Browse source tree",
      icon: "mdi:file-tree",
      hidden: (commit) => commit.id === "--",
      handler: async (dispatch, commit) => {
        dispatch(SHOW_LSTREE(commit));
      }
    }),
    []
  );
