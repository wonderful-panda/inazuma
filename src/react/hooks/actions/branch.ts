import { useAtomValue, useSetAtom } from "jotai";
import { openDialogAtom } from "../../state/repository/dialog";
import { useCallback } from "react";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useShowConfirmDialog, useShowWarning } from "../../state/root";
import { useWithRef } from "@/hooks/useWithRef";
import { useCallbackWithErrorHandler } from "@/hooks/useCallbackWithErrorHandler";
import { repoPathAtom } from "../../state/repository";
import { useReloadRepository } from "@/hooks/actions/openRepository";

export const useBeginCreateBranch = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const openDialog = useSetAtom(openDialogAtom);
  return useCallback(
    (commitId: string) => {
      if (!repoPath) {
        return;
      }
      openDialog({ type: "NewBranch", commitId });
    },
    [repoPath, openDialog]
  );
};

export const useCreateBranch = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const [, reloadRepository] = useWithRef(useReloadRepository());
  const showWarning = useShowWarning();
  return useCallbackWithErrorHandler(
    async (options: CreateBranchOptions) => {
      if (!repoPath) {
        return false;
      }
      if (!options.branchName) {
        showWarning("Branch name is not specified");
        return false;
      }
      await invokeTauriCommand("create_branch", { repoPath, options });
      await reloadRepository.current();
      return true;
    },
    [repoPath, reloadRepository, showWarning]
  );
};

export const useDeleteBranch = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const [, reloadRepository] = useWithRef(useReloadRepository());
  return useCallbackWithErrorHandler(
    async (options: DeleteBranchOptions) => {
      if (!repoPath) {
        return false;
      }
      await invokeTauriCommand("delete_branch", { repoPath, options });
      await reloadRepository.current();
      return true;
    },
    [repoPath, reloadRepository]
  );
};

export const useSwitchBranch = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const showConfirmDialog = useShowConfirmDialog();
  const [, reloadRepository] = useWithRef(useReloadRepository());
  const showWarning = useShowWarning();
  return useCallbackWithErrorHandler(
    async (options: DeleteBranchOptions) => {
      if (!repoPath) {
        return false;
      }
      if (!options.branchName) {
        showWarning("Branch name is not specified");
        return false;
      }
      const ret = await showConfirmDialog({
        title: "Switch branch",
        content: `Switch to branch [${options.branchName}]`
      });
      if (!ret) {
        return;
      }

      await invokeTauriCommand("switch", { repoPath, options });
      await reloadRepository.current();
      return true;
    },
    [repoPath, reloadRepository, showConfirmDialog, showWarning]
  );
};
