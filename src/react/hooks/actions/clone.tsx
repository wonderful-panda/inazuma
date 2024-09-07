import { useDialog } from "@/context/DialogContext";
import { useXterm } from "../useXterm";
import { useCallback } from "react";
import { CloneDialogBody } from "@/components/home/CloneDialogBody";
import { useConfigValue } from "@/state/root";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useOpenRepository } from "./openRepository";
import { useWithRef } from "../useWithRef";

export const useBeginClone = () => {
  const dialog = useDialog();
  const xterm = useXterm();
  const [, openRepositoryRef] = useWithRef(useOpenRepository());

  const { fontFamily } = useConfigValue();

  const openXterm = useCallback(
    (el: HTMLDivElement, url: string, destinationFolder: string) => {
      return new Promise<boolean>((resolve) => {
        void xterm.open(el, {
          openPty: (id, rows, cols) =>
            invokeTauriCommand("exec_git_with_pty", {
              id,
              command: "clone",
              args: [url, destinationFolder],
              rows,
              cols
            }),
          fontFamily: fontFamily.monospace ?? "monospace",
          fontSize: 16,
          onExit: async (succeeded: boolean) => {
            if (succeeded) {
              await openRepositoryRef.current?.(destinationFolder);
            }
            resolve(succeeded);
          }
        });
      });
    },
    [xterm, fontFamily.monospace, openRepositoryRef]
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
