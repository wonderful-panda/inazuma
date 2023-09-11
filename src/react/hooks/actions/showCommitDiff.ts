import { repoPathAtom } from "@/state/repository";
import { addTabAtom } from "@/state/repository/tabs";
import { shortHash } from "@/util";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";

export const useShowCommitDiff = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const addTab = useSetAtom(addTabAtom);
  return useCallbackWithErrorHandler(
    (commit1: Commit, commit2: Commit) => {
      if (!repoPath) {
        return;
      }
      addTab({
        type: "commitDiff",
        id: `commitDiff:${commit1.id}-${commit2.id}`,
        title: `COMPARE @ ${shortHash(commit1.id)}-${shortHash(commit2.id)}`,
        payload: { commit1, commit2 },
        closable: true
      });
    },
    [repoPath, addTab]
  );
};
