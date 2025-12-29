import { useAtomValue } from "jotai";
import { useCallback } from "react";
import type { DialogResult } from "@/shared/components/ui/Dialog";
import { PushDialogBody } from "@/components/repository/PushDialogBody";
import { useAlert } from "@/core/context/AlertContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { repoPathAtom } from "@/state/repository";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";
import { useExecuteGitInXterm } from "@/shared/hooks/shell/useXterm";
import { useXtermDialog } from "@/shared/hooks/shell/useXtermDialog";

export const useBeginPush = () => {
  const alert = useAlert();
  const { execute, kill, isRunning } = useExecuteGitInXterm();
  const dialog = useXtermDialog({ isRunning });
  const repoPath = useAtomValue(repoPathAtom);

  const openXterm = useCallback(
    (el: HTMLDivElement, remote: string, branchName: string) => {
      return execute(el, {
        command: "push",
        args: [remote, branchName],
        repoPath
      });
    },
    [execute, repoPath]
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
