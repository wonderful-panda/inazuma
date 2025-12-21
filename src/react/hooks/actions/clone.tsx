import { useCallback } from "react";
import { CloneDialogBody } from "@/components/home/CloneDialogBody";
import { useWithRef } from "../useWithRef";
import { useExecuteGitInXterm } from "../useXterm";
import { useXtermDialog } from "../useXtermDialog";
import { useOpenRepository } from "./openRepository";

export const useBeginClone = () => {
  const [, openRepositoryRef] = useWithRef(useOpenRepository());

  const { execute, kill, isRunning } = useExecuteGitInXterm();
  const dialog = useXtermDialog({ isRunning });

  const openXterm = useCallback(
    (el: HTMLDivElement, url: string, destinationFolder: string) => {
      return execute(
        el,
        {
          command: "clone",
          args: [url, destinationFolder]
        },
        {
          onSucceeded: async () => {
            await openRepositoryRef.current?.(destinationFolder);
          }
        }
      );
    },
    [execute]
  );

  return useCallback(() => {
    return dialog.showModal(<CloneDialogBody openXterm={openXterm} killPty={kill} />);
  }, [dialog, openXterm, kill]);
};
