import { repoPathAtom } from "@/state/repository";
import { addTabAtom } from "@/state/repository/tabs";
import { shortHash } from "@/util";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";

export const useShowLsTree = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const addTab = useSetAtom(addTabAtom);
  return useCallbackWithErrorHandler(
    (commit: Commit) => {
      if (!repoPath) {
        return;
      }
      addTab({
        type: "tree",
        id: `tree:${commit.id}`,
        title: `TREE @ ${shortHash(commit.id)}`,
        payload: { commit },
        closable: true
      });
    },
    [repoPath, addTab]
  );
};
