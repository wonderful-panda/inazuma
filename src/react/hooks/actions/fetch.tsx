import { useAtomValue } from "jotai";
import { useCallback } from "react";
import type { DialogResult } from "@/components/Dialog";
import { FetchDialogBody, type FetchOptions } from "@/components/repository/FetchDialogBody";
import { useAlert } from "@/context/AlertContext";
import { useDialog } from "@/context/DialogContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { repoPathAtom } from "@/state/repository";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { useExecuteGitInXterm } from "../useXterm";

export const useBeginFetch = () => {
  const dialog = useDialog();
  const alert = useAlert();
  const repoPath = useAtomValue(repoPathAtom);

  const { execute, kill } = useExecuteGitInXterm();

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
    return await dialog.showModal({
      content: <FetchDialogBody openXterm={openXterm} killPty={kill} remotes={remotes} />,
      onBeforeClose: async () => {
        await kill();
        return true;
      }
    });
  }, [dialog, openXterm, kill, alert, repoPath]);
};
