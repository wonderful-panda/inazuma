import { dispatchBrowser } from "@/dispatchBrowser";
import { SHOW_SUCCESS } from "@/store/misc";
import { shortHash } from "@/util";
import { CommitCommand } from "./types";

export const copyFullHash: CommitCommand = {
  id: "CopyFullHash",
  label: "Copy full hash",
  hidden: (commit) => commit.id === "--",
  handler: async (dispatch, commit) => {
    await dispatchBrowser("copyTextToClipboard", commit.id);
    dispatch(SHOW_SUCCESS(`Copied: ${commit.id}`));
  }
};

export const copyShortHash: CommitCommand = {
  id: "CopyShortHash",
  label: "Copy short hash",
  hidden: (commit) => commit.id === "--",
  handler: async (dispatch, commit) => {
    const hash = shortHash(commit.id);
    await dispatchBrowser("copyTextToClipboard", hash);
    dispatch(SHOW_SUCCESS(`Copied: ${hash}`));
  }
};
