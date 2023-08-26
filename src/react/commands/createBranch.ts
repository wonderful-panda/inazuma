import { BEGIN_CREATE_BRANCH } from "@/store/thunk/createBranch";
import { CommitCommand } from "./types";

export const createBranch: CommitCommand = {
  id: "CreateBranch",
  label: "Create new branch",
  icon: "octicon:git-branch-16",
  hidden: (commit) => commit.id === "--",
  handler: async (dispatch, commit) => {
    dispatch(BEGIN_CREATE_BRANCH(commit.id));
  }
};
