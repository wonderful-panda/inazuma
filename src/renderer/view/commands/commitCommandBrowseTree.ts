import { CommitCommand } from "./types";

export const commitCommandBrowseTree: CommitCommand = {
  id: "BrowseTree",
  label: "Browse file tree",
  handler(store, commit) {
    store.actions.showTreeTab(commit.id);
  }
};
