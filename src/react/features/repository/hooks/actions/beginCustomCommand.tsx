import { useAtomValue } from "jotai";
import { useCallback } from "react";
import { CustomCommandDialogBody } from "@/features/repository/components/dialogs/CustomCommandDialogBody";
import { useReloadRepository } from "@/features/repository/hooks/actions/openRepository";
import { repoPathAtom } from "@/features/repository/state";
import type { DialogResult } from "@/shared/components/ui/Dialog";
import { useExecuteCustomCommandInXterm } from "@/shared/hooks/shell/useXterm";
import { useXtermDialog } from "@/shared/hooks/shell/useXtermDialog";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";

export const useBeginCustomCommand = () => {
  const { execute, kill, isRunning } = useExecuteCustomCommandInXterm();
  const dialog = useXtermDialog({ isRunning });
  const repoPath = useAtomValue(repoPathAtom);
  const reloadRepository = useReloadRepository();

  const openXterm = useCallback(
    async (el: HTMLDivElement, commandLine: string) => {
      return await execute(
        el,
        {
          commandLine,
          repoPath
        },
        { onSucceeded: reloadRepository }
      );
    },
    [execute, repoPath, reloadRepository]
  );

  return useCallbackWithErrorHandler(
    async (
      name: string,
      description: string | undefined,
      commandLine: string
    ): Promise<DialogResult | "failed"> => {
      return await dialog.showModal(
        <CustomCommandDialogBody
          name={name}
          description={description}
          commandLine={commandLine}
          openXterm={openXterm}
          killPty={kill}
        />
      );
    },
    [dialog, openXterm, kill]
  );
};
