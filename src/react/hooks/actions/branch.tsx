import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useWithRef } from "@/hooks/useWithRef";
import { useCallbackWithErrorHandler } from "@/hooks/useCallbackWithErrorHandler";
import { repoPathAtom } from "../../state/repository";
import { useReloadRepository } from "@/hooks/actions/openRepository";
import { useConfirmDialog } from "@/context/ConfirmDialogContext";
import { useDialog } from "@/context/DialogContext";
import { NewBranchDialogBody } from "@/components/repository/NewBranchDialogBody";
import { DeleteBranchDialogBody } from "@/components/repository/DeleteBranchDialogBody";
import { useAlert } from "@/context/AlertContext";

export const useBeginCreateBranch = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const dialog = useDialog();

  return useCallback(
    async (commitId: string) => {
      if (!repoPath) {
        return;
      }
      return await dialog.showModal({
        content: <NewBranchDialogBody commitId={commitId} />,
        defaultActionKey: "Enter"
      });
    },
    [repoPath, dialog]
  );
};

export const useCreateBranch = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const [, reloadRepository] = useWithRef(useReloadRepository());
  const { showWarning } = useAlert();
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

export const useBeginDeleteBranch = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const dialog = useDialog();
  return useCallback(
    async (branchName: string) => {
      if (!repoPath) {
        return;
      }
      return await dialog.showModal({
        content: <DeleteBranchDialogBody branchName={branchName} />
      });
    },
    [repoPath, dialog]
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
  const confirm = useConfirmDialog();
  const [, reloadRepository] = useWithRef(useReloadRepository());
  const { showWarning } = useAlert();
  return useCallbackWithErrorHandler(
    async (options: DeleteBranchOptions) => {
      if (!repoPath) {
        return false;
      }
      if (!options.branchName) {
        showWarning("Branch name is not specified");
        return false;
      }
      const ret = await confirm.showModal({
        title: "Switch branch",
        content: `Switch to branch [${options.branchName}]`
      });
      if (ret !== "accepted") {
        return;
      }

      await invokeTauriCommand("switch", { repoPath, options });
      await reloadRepository.current();
      return true;
    },
    [repoPath, reloadRepository, confirm, showWarning]
  );
};
