import { useDialog } from "@/context/DialogContext";
import { useExecuteGitInXterm } from "../useXterm";
import { useCallback } from "react";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAlert } from "@/context/AlertContext";
import type { DialogResult } from "@/components/Dialog";
import { FetchDialogBody, type FetchOptions } from "@/components/repository/FetchDialogBody";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { useAtomValue } from "jotai";
import { repoPathAtom } from "@/state/repository";

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
