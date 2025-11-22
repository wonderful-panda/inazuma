import { useAtomValue, useSetAtom } from "jotai";
import { repoPathAtom, setCommitDetailAtom } from "@/state/repository";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { useTauriQueryInvoke } from "../useTauriQuery";

export const useFetchCommitDetail = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const setCommitDetail = useSetAtom(setCommitDetailAtom);
  const fetchTauriQuery = useTauriQueryInvoke();
  return useCallbackWithErrorHandler(
    async (revspec: string) => {
      if (!repoPath) {
        return;
      }
      const value = await fetchTauriQuery("get_commit_detail", { repoPath, revspec });
      setCommitDetail({ repoPath, value });
    },
    [repoPath, setCommitDetail, fetchTauriQuery]
  );
};
