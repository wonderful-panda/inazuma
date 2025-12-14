import type React from "react";
import { useCallback, useMemo } from "react";
import { useAlert } from "@/context/AlertContext";
import { useDialog } from "@/context/DialogContext";

export const useXtermDialog = ({ isRunning }: { isRunning: () => boolean }) => {
  const dialog = useDialog();
  const alert = useAlert();

  const showModal = useCallback(
    async (content: React.ReactNode) => {
      return await dialog.showModal({
        content,
        onBeforeClose: async () => {
          if (isRunning()) {
            alert.showWarning("Process is still running.");
            return false;
          }
          return true;
        }
      });
    },
    [dialog, alert, isRunning]
  );

  return useMemo(() => ({ showModal }), [showModal]);
};
