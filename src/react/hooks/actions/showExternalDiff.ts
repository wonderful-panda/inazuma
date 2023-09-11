import { repoPathAtom } from "@/state/repository";
import { useConfigValue, useShowWarning } from "@/state/root";
import { useAtomValue } from "jotai";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { invokeTauriCommand } from "@/invokeTauriCommand";

export const useShowExternalDiff = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const config = useConfigValue();
  const showWarning = useShowWarning();
  return useCallbackWithErrorHandler(
    async (left: FileSpec, right: FileSpec) => {
      if (!repoPath) {
        return;
      }
      if (!config.externalDiffTool) {
        showWarning("External diff tool is not configured");
        return;
      }
      await invokeTauriCommand("show_external_diff", { repoPath, left, right });
    },
    [repoPath, config.externalDiffTool, showWarning]
  );
};
