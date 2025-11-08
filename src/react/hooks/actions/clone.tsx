import { useCallback } from "react";
import { CloneDialogBody } from "@/components/home/CloneDialogBody";
import { useDialog } from "@/context/DialogContext";
import { useWithRef } from "../useWithRef";
import { useExecuteGitInXterm } from "../useXterm";
import { useOpenRepository } from "./openRepository";

export const useBeginClone = () => {
  const dialog = useDialog();
  const [, openRepositoryRef] = useWithRef(useOpenRepository());

  const { execute, kill } = useExecuteGitInXterm();

  const openXterm = useCallback(
    (el: HTMLDivElement, url: string, destinationFolder: string) => {
      return execute(el, {
        command: "clone",
        args: [url, destinationFolder],
        onSucceeded: async () => {
          await openRepositoryRef.current?.(destinationFolder);
        }
      });
    },
    [execute]
  );

  return useCallback(() => {
    return dialog.showModal({
      content: <CloneDialogBody openXterm={openXterm} killPty={kill} />,
      onBeforeClose: async () => {
        await kill();
        return true;
      }
    });
  }, [dialog, openXterm, kill]);
};
