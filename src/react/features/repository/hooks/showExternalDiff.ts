import { useAtomValue } from "jotai";
import { useAlert } from "@/core/context/AlertContext";
import { useConfigValue } from "@/core/state/root";
import { repoPathAtom } from "@/features/repository/state";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useCallbackWithErrorHandler } from "@/shared/hooks/utils/useCallbackWithErrorHandler";

export const useShowExternalDiff = () => {
  const repoPath = useAtomValue(repoPathAtom);
  const config = useConfigValue();
  const { showWarning } = useAlert();
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
