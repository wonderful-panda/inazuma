import { BEGIN_CREATE_BRANCH } from "@/store/thunk/branch";
import { CommitCommand } from "./types";
import { useMemo } from "react";
import { useDispatch } from "@/store";

export const useCreateBranchCommand = () => {
  const dispatch = useDispatch();
  return useMemo<CommitCommand>(
    () => ({
      type: "commit",
      id: "CreateBranch",
      label: "Create new branch",
      icon: "octicon:git-branch-16",
      hidden: (commit) => commit.id === "--",
      handler: async (commit) => {
        dispatch(BEGIN_CREATE_BRANCH(commit.id));
      }
    }),
    [dispatch]
  );
};
