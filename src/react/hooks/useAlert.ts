import { AlertContext, AlertHandler } from "@/context/AlertContext";
import { useCallback, useContext } from "react";

export const useAlert = (): AlertHandler => {
  return useContext(AlertContext);
};

export const useErrorReporter = (): ((e: unknown) => void) => {
  const handler = useContext(AlertContext);
  const errorReporter = useCallback(
    (e: unknown) => {
      handler.show("error", (e as any).toString());
    },
    [handler.show]
  );
  return errorReporter;
};
