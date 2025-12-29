import { useAtomValue, useSetAtom } from "jotai";
import { repoPathAtom } from "@/features/repository/state";
import { addRepoTabAtom } from "@/features/repository/state/tabs";
import { shortHash } from "@/util";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";

export const useShowCommitDiff = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const addTab = useSetAtom(addRepoTabAtom);
  return useCallbackWithErrorHandler(
    (commitFrom: Commit | "parent", commitTo: Commit) => {
      if (!repoPath) {
        return;
      }
      addTab({
        type: "commitDiff",
        id: `commitDiff:${commitFrom !== "parent" ? commitFrom.id : "PARENT"}-${commitTo.id}`,
        title:
          commitFrom !== "parent"
            ? `DIFF @ ${shortHash(commitFrom.id)}<->${shortHash(commitTo.id)}`
            : `CHANGES @ ${shortHash(commitTo.id)}`,
        payload: { commitFrom, commitTo },
        closable: true
      });
    },
    [repoPath, addTab]
  );
};
