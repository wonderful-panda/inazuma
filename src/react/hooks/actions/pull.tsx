import { useDialog } from "@/context/DialogContext";
import { useExecuteGitInXterm } from "../useXterm";
import { useCallback } from "react";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAlert } from "@/context/AlertContext";
import type { DialogResult } from "@/components/Dialog";
import { useAtomValue } from "jotai";
import { repoPathAtom } from "@/state/repository";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { PullDialogBody, type PullOptions } from "@/components/repository/PullDialogBody";

export const useBeginPull = () => {
  const dialog = useDialog();
  const alert = useAlert();
  const repoPath = useAtomValue(repoPathAtom);

  const { execute, kill } = useExecuteGitInXterm();

  const openXterm = useCallback(
    (el: HTMLDivElement, opt: PullOptions) => {
      return execute(el, {
        command: "pull",
        args: [
          opt.remote,
          opt.mode,
          opt.tags ? "--tags" : "--no-tags",
          opt.autoStash ? "--autostash" : "--no-autostash"
        ],
        repoPath
      });
    },
    [execute, repoPath]
  );

  return useCallbackWithErrorHandler(async (): Promise<DialogResult | "failed"> => {
    const remotes = await invokeTauriCommand("get_remote_list", { repoPath });
    if (remotes.length === 0) {
      alert.showWarning("No remote repository is registered");
      return { result: "rejected" };
    }
    return await dialog.showModal({
      content: <PullDialogBody openXterm={openXterm} killPty={kill} remotes={remotes} />,
      onBeforeClose: async () => {
        await kill();
        return true;
      }
    });
  }, [dialog, openXterm, kill, alert, repoPath]);
};
