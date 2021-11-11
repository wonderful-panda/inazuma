import browserApi from "@/browserApi";
import { SHOW_ALERT } from "@/store/misc";
import { shortHash } from "@/util";
import { CommitCommand } from "./types";

export const copyFullHash: CommitCommand = {
  id: "CopyFullHash",
  label: "Copy full hash",
  hidden: (commit) => commit.id === "--",
  handler: async (dispatch, commit) => {
    await browserApi.yankText(commit.id);
    dispatch(SHOW_ALERT({ type: "success", message: `Copied: ${commit.id}` }));
  }
};

export const copyShortHash: CommitCommand = {
  id: "CopyShortHash",
  label: "Copy short hash",
  hidden: (commit) => commit.id === "--",
  handler: async (dispatch, commit) => {
    const hash = shortHash(commit.id);
    await browserApi.yankText(hash);
    dispatch(SHOW_ALERT({ type: "success", message: `Copied: ${hash}` }));
  }
};
