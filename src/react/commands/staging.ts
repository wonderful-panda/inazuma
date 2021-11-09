import { STAGE, UNSTAGE } from "@/store/thunk/staging";
import { FileCommand } from "./types";

export const stage: FileCommand = {
  id: "Stage",
  label: "Stage selected file",
  icon: "mdi:plus",
  hidden: (commit, file) => {
    return commit.id !== "--" || !file.unstaged;
  },
  handler(dispatch, _, file) {
    dispatch(STAGE(file.path));
  }
};

export const unstage: FileCommand = {
  id: "Unstage",
  label: "Unstage selected file",
  icon: "mdi:minus",
  hidden: (commit, file) => {
    return commit.id !== "--" || !!file.unstaged;
  },
  handler(dispatch, _, file) {
    dispatch(UNSTAGE(file.path));
  }
};
