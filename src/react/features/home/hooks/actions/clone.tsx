import { useCallback } from "react";
import { CloneDialogBody } from "@/features/home/components/CloneDialogBody";
import { useExecuteGitInXterm } from "@/shared/hooks/shell/useXterm";
import { useXtermDialog } from "@/shared/hooks/shell/useXtermDialog";
import { useWithRef } from "@/shared/hooks/utils/useWithRef";
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
