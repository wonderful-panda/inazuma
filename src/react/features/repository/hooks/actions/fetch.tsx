import { useAtomValue } from "jotai";
import { useCallback } from "react";
import type { DialogResult } from "@/shared/components/ui/Dialog";
import { FetchDialogBody, type FetchOptions } from "@/features/repository/components/dialogs/FetchDialogBody";
import { useAlert } from "@/core/context/AlertContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { repoPathAtom } from "@/features/repository/state";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";
import { useExecuteGitInXterm } from "@/shared/hooks/shell/useXterm";
import { useXtermDialog } from "@/shared/hooks/shell/useXtermDialog";

export const useBeginFetch = () => {
  const alert = useAlert();
  const repoPath = useAtomValue(repoPathAtom);

  const { execute, kill, isRunning } = useExecuteGitInXterm();
  const dialog = useXtermDialog({ isRunning });

  const openXterm = useCallback(
    (el: HTMLDivElement, options: FetchOptions) => {
      return execute(el, {
        command: "fetch",
        args: [
          options.type === "all" ? "--all" : options.remote,
          options.tags ? "--tags" : "--no-tags"
        ],
        repoPath
      });
    },
    [execute, repoPath]
  );

  return useCallbackWithErrorHandler(async (): Promise<DialogResult> => {
    const remotes = await invokeTauriCommand("get_remote_list", { repoPath });
    if (remotes.length === 0) {
      alert.showWarning("No remote repository is registered");
      return { result: "rejected" };
    }
    return dialog.showModal(
      <FetchDialogBody openXterm={openXterm} killPty={kill} remotes={remotes} />
    );
  }, [dialog, openXterm, kill, alert, repoPath]);
};
