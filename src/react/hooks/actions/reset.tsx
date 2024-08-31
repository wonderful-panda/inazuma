import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { useWithRef } from "@/hooks/useWithRef";
import { useCallbackWithErrorHandler } from "@/hooks/useCallbackWithErrorHandler";
import { currentBranchAtom, repoPathAtom } from "../../state/repository";
import { useReloadRepository } from "@/hooks/actions/openRepository";
import { useDialog } from "@/context/DialogContext";
import { ResetDialogBody } from "@/components/repository/ResetBranchDialogBody";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";

export const useBeginReset = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const currentBranch = useAtomValue(currentBranchAtom);
  const dialog = useDialog();

  return useCallback(
    async (commit: Commit, branchName?: string) => {
      if (!repoPath) {
        return;
      }
      const actualBranchName = branchName ?? currentBranch?.name;
      if (!actualBranchName) {
        return;
      }
      return await dialog.showModal({
        content: <ResetDialogBody branchName={actualBranchName} destination={commit} />,
        defaultActionKey: "Enter"
      });
    },
    [repoPath, currentBranch, dialog]
  );
};

export const useReset = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const [, reloadRepository] = useWithRef(useReloadRepository());
  const confirm = useConfirmDialog();
  return useCallbackWithErrorHandler(async () => {
    if (!repoPath) {
      return false;
    }
    const ret = await confirm.showModal({
      title: "Reset",
      content: "Not implemented"
    });
    if (ret === "accepted") {
      await reloadRepository.current();
      return true;
    } else {
      return false;
    }
  }, [repoPath, reloadRepository, confirm]);
};
