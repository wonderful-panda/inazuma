import { useDialog } from "@/context/DialogContext";
import { useExecuteGitInXterm } from "../useXterm";
import { useCallback } from "react";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAlert } from "@/context/AlertContext";
import { PushDialogBody } from "@/components/repository/PushDialogBody";
import type { DialogResult } from "@/components/Dialog";
import { useAtomValue } from "jotai";
import { repoPathAtom } from "@/state/repository";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";

export const useBeginPush = () => {
  const dialog = useDialog();
  const alert = useAlert();
  const { execute, kill } = useExecuteGitInXterm();
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
      return await dialog.showModal({
        content: (
          <PushDialogBody
            openXterm={openXterm}
            killPty={kill}
            remotes={remotes}
            branchName={branchName}
          />
        ),
        onBeforeClose: async () => {
          await kill();
          return true;
        }
      });
    },
    [dialog, openXterm, kill, alert, repoPath]
  );
};
