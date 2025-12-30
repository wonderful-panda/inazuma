import { useAtomValue, useSetAtom } from "jotai";
import { repoPathAtom } from "@/features/repository/state";
import { addRepoTabAtom } from "@/features/repository/state/tabs";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";
import { shortHash } from "@/shared/utils/util";

export const useShowLsTree = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const addTab = useSetAtom(addRepoTabAtom);
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
