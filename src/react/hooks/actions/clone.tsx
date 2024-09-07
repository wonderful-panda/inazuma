import { useDialog } from "@/context/DialogContext";
import { useXterm } from "../useXterm";
import { useCallback } from "react";
import { CloneDialogBody } from "@/components/home/CloneDialogBody";
import { useConfigValue } from "@/state/root";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useOpenRepository } from "./openRepository";
import { useWithRef } from "../useWithRef";
import { assertNever } from "@/util";
import { useAlert } from "@/context/AlertContext";

export const useBeginClone = () => {
  const dialog = useDialog();
  const xterm = useXterm();
  const alert = useAlert();
  const [, openRepositoryRef] = useWithRef(useOpenRepository());

  const { fontFamily } = useConfigValue();

  const openXterm = useCallback(
    (el: HTMLDivElement, url: string, destinationFolder: string) => {
      return new Promise<boolean>((resolve) => {
        void xterm.open(el, {
          openPty: (id, rows, cols) => {
            alert.clear();
            return invokeTauriCommand("exec_git_with_pty", {
              id,
              command: "clone",
              args: [url, destinationFolder],
              rows,
              cols
            });
          },
          fontFamily: fontFamily.monospace ?? "monospace",
          fontSize: 16,
          onExit: async (status) => {
            switch (status) {
              case "succeeded":
                await openRepositoryRef.current?.(destinationFolder);
                break;
              case "failed":
                alert.showError("Failed to clone repository");
                break;
              case "aborted":
                alert.showWarning("Cancelled.");
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
    [xterm, fontFamily.monospace, openRepositoryRef, alert]
  );

  return useCallback(() => {
    return dialog.showModal({
      content: <CloneDialogBody openXterm={openXterm} />,
      onBeforeClose: async () => {
        await xterm.kill();
        return true;
      }
    });
  }, [dialog, openXterm, xterm]);
};
