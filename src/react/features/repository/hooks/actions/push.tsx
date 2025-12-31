import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { useAlert } from "@/core/context/AlertContext";
import { invokeTauriCommand } from "@/core/utils/invokeTauriCommand";
import { PushDialogBody } from "@/features/repository/components/PushDialogBody";
import { useReloadRepository } from "@/features/repository/hooks/actions/openRepository";
import { repoPathAtom } from "@/features/repository/state";
import type { DialogResult } from "@/shared/components/ui/Dialog";
import { useExecuteGitInXterm } from "@/shared/hooks/shell/useXterm";
import { useXtermDialog } from "@/shared/hooks/shell/useXtermDialog";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";

export const useBeginPush = () => {
  const alert = useAlert();
  const { execute, kill, isRunning } = useExecuteGitInXterm();
  const dialog = useXtermDialog({ isRunning });
  const repoPath = useAtomValue(repoPathAtom);
  const reloadRepository = useReloadRepository();

  const openXterm = useCallback(
    (el: HTMLDivElement, remote: string, branchName: string) => {
      return execute(
        el,
        {
          command: "push",
          args: [remote, branchName],
          repoPath
        },
        { onSucceeded: reloadRepository }
      );
    },
    [execute, repoPath, reloadRepository]
  );

  return useCallbackWithErrorHandler(
    async (branchName: string): Promise<DialogResult | "failed"> => {
      const remotes = await invokeTauriCommand("get_remote_list", { repoPath });
      if (remotes.length === 0) {
        alert.showWarning("No remote repository is registered");
        return { result: "rejected" };
      }
      return await dialog.showModal(
        <PushDialogBody
          openXterm={openXterm}
          killPty={kill}
          remotes={remotes}
          branchName={branchName}
        />
      );
    },
    [dialog, openXterm, kill, alert, repoPath]
  );
};
