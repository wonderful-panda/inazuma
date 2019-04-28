import { CommitCommand } from "./types";
import { store, rootModule } from "../store";
const rootCtx = rootModule.context(store);

export const commitCommandBrowseTree: CommitCommand = {
  id: "BrowseTree",
  label: "Browse file tree",
  handler(commit) {
    rootCtx.dispatch("showTreeTab", { sha: commit.id });
  }
};
