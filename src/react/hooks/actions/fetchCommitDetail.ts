import { repoPathAtom, setCommitDetailAtom } from "@/state/repository";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { invokeTauriCommand } from "@/invokeTauriCommand";

export const useFetchCommitDetail = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const setCommitDetail = useSetAtom(setCommitDetailAtom);
  return useCallbackWithErrorHandler(
    async (revspec: string) => {
      if (!repoPath) {
        return;
      }
      const value = await invokeTauriCommand("get_commit_detail", { repoPath, revspec });
      setCommitDetail({ repoPath, value });
    },
    [repoPath, setCommitDetail]
  );
};
