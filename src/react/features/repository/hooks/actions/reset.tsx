import type { ResetOptions } from "@backend/ResetOptions";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { useDialog } from "@/core/context/DialogContext";
import { invokeTauriCommand } from "@/core/utils/invokeTauriCommand";
import { ResetDialogBody } from "@/features/repository/components/ResetBranchDialogBody";
import { currentBranchAtom, repoPathAtom } from "@/features/repository/state";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";
import { useReloadRepository } from "./openRepository";

export const useBeginReset = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const currentBranch = useAtomValue(currentBranchAtom);
  const dialog = useDialog();

  return useCallback(
    async (commit: Commit) => {
      if (!repoPath) {
        return;
      }
      if (!currentBranch) {
        return;
      }
      return await dialog.showModal({
        content: <ResetDialogBody branchName={currentBranch.name} destination={commit} />,
        defaultActionKey: "Enter"
      });
    },
    [repoPath, currentBranch, dialog]
  );
};

export const useReset = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const reloadRepository = useReloadRepository();
  return useCallbackWithErrorHandler(
    async (options: ResetOptions) => {
      if (!repoPath) {
        return false;
      }
      await invokeTauriCommand("reset", { repoPath, options });
      await reloadRepository();
      return true;
    },
    [repoPath, reloadRepository]
  );
};
