import { useAtomValue, useSetAtom } from "jotai";
import { repoPathAtom, setCommitDetailAtom } from "@/features/repository/state";
import { useTauriQueryInvoke } from "@/shared/hooks/integration/useTauriQuery";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";

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
