import { CommitCommand } from "./types";
import { useRootModule } from "../store";
const rootCtx = useRootModule();

export const commitCommandBrowseTree: CommitCommand = {
  id: "BrowseTree",
  label: "Browse file tree",
  handler(commit) {
    rootCtx.dispatch("showTreeTab", { sha: commit.id });
  }
};
