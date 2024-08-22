import { repoPathAtom } from "@/state/repository";
import { useConfigValue } from "@/state/root";
import { useAtomValue } from "jotai";
import { useCallbackWithErrorHandler } from "../useCallbackWithErrorHandler";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAlert } from "@/context/AlertContext";

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
