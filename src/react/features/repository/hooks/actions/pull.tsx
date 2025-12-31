import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { useAlert } from "@/core/context/AlertContext";
import { invokeTauriCommand } from "@/core/utils/invokeTauriCommand";
import { PullDialogBody, type PullOptions } from "@/features/repository/components/PullDialogBody";
import { useReloadRepository } from "@/features/repository/hooks/actions/openRepository";
import { repoPathAtom } from "@/features/repository/state";
import type { DialogResult } from "@/shared/components/ui/Dialog";
import { useExecuteGitInXterm } from "@/shared/hooks/shell/useXterm";
import { useXtermDialog } from "@/shared/hooks/shell/useXtermDialog";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";

export const useBeginPull = () => {
  const alert = useAlert();
  const repoPath = useAtomValue(repoPathAtom);
  const reloadRepository = useReloadRepository();

  const { execute, kill, isRunning } = useExecuteGitInXterm();
  const dialog = useXtermDialog({ isRunning });

  const openXterm = useCallback(
    (el: HTMLDivElement, opt: PullOptions) => {
      return execute(
        el,
        {
          command: "pull",
          args: [
            opt.remote,
            opt.mode,
            opt.tags ? "--tags" : "--no-tags",
            opt.autoStash ? "--autostash" : "--no-autostash"
          ],
          repoPath
        },
        { onSucceeded: reloadRepository }
      );
    },
    [execute, repoPath, reloadRepository]
  );

  return useCallbackWithErrorHandler(async (): Promise<DialogResult | "failed"> => {
    const remotes = await invokeTauriCommand("get_remote_list", { repoPath });
    if (remotes.length === 0) {
      alert.showWarning("No remote repository is registered");
      return { result: "rejected" };
    }
    return await dialog.showModal(
      <PullDialogBody openXterm={openXterm} killPty={kill} remotes={remotes} />
    );
  }, [dialog, openXterm, kill, alert, repoPath]);
};
