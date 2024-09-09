import { useDialog } from "@/context/DialogContext";
import { useXterm } from "../useXterm";
import { useCallback } from "react";
import { useConfigValue } from "@/state/root";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { assertNever } from "@/util";
import { useAlert } from "@/context/AlertContext";
import { BOLD, CRLF, RESET, ULINE, YELLOW } from "@/ansiEscape";
import { useWithRef } from "../useWithRef";
import { useReloadRepository } from "./openRepository";
import { PushDialogBody } from "@/components/repository/PushDialogBody";
import { DialogResult } from "@/components/Dialog";
import { useAtomValue } from "jotai";
import { repoPathAtom } from "@/state/repository";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";

export const useBeginPush = () => {
  const dialog = useDialog();
  const xterm = useXterm();
  const alert = useAlert();
  const repoPath = useAtomValue(repoPathAtom);

  const { fontFamily } = useConfigValue();
  const [, reloadRepositoryRef] = useWithRef(useReloadRepository());

  const openXterm = useCallback(
    (el: HTMLDivElement, remote: string, branchName: string) => {
      return new Promise<boolean>((resolve) => {
        void xterm.open(el, {
          openPty: (id, rows, cols) => {
            alert.clear();
            return invokeTauriCommand("exec_git_with_pty", {
              id,
              command: "push",
              args: [remote, branchName],
              rows,
              cols
            });
          },
          fontFamily: fontFamily.monospace ?? "monospace",
          fontSize: 16,
          onExit: async (status) => {
            switch (status) {
              case "succeeded":
                await reloadRepositoryRef.current?.();
                break;
              case "failed":
                alert.showError("Failed to push.");
                xterm.write(CRLF + BOLD + ULINE + YELLOW + "### FAILED ###" + RESET + CRLF);
                break;
              case "aborted":
                alert.showWarning("Cancelled.");
                xterm.write(CRLF + BOLD + ULINE + YELLOW + "### CANCELLED ###" + RESET + CRLF);
                break;
              default:
                assertNever(status);
                break;
            }
            resolve(status === "succeeded");
          }
        });
      });
    },
    [xterm, fontFamily.monospace, reloadRepositoryRef, alert]
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
            killPty={xterm.kill}
            remotes={remotes}
            branchName={branchName}
          />
        ),
        onBeforeClose: async () => {
          await xterm.kill();
          return true;
        }
      });
    },
    [dialog, openXterm, xterm, alert, repoPath]
  );
};
