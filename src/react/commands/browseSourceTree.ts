import { SHOW_LSTREE } from "@/store/thunk/showLsTree";
import { CommitCommand } from "./types";

export const browseSourceTree: CommitCommand = {
  id: "BrowseSourceTree",
  label: "Browse source tree",
  icon: "mdi:file-tree",
  hidden: (commit) => commit.id === "--",
  handler: async (dispatch, commit) => {
    dispatch(SHOW_LSTREE(commit));
  }
};
