import { useAtomValue } from "jotai";
import { useCallback } from "react";
import type { DialogResult } from "@/shared/components/ui/Dialog";
import { CustomCommandDialogBody } from "@/components/repository/CustomCommandDialogBody";
import { repoPathAtom } from "@/state/repository";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";
import { useExecuteCustomCommandInXterm } from "@/shared/hooks/shell/useXterm";
import { useXtermDialog } from "@/shared/hooks/shell/useXtermDialog";

export const useBeginCustomCommand = () => {
  const { execute, kill, isRunning } = useExecuteCustomCommandInXterm();
  const dialog = useXtermDialog({ isRunning });
  const repoPath = useAtomValue(repoPathAtom);

  const openXterm = useCallback(
    async (el: HTMLDivElement, commandLine: string) => {
      return await execute(el, {
        commandLine,
        repoPath
      });
    },
    [execute, repoPath]
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
