import { GlobalAlert, AlertMethods } from "@/components/Alert";
import { nope } from "@/util";
import { createContext, useContext, useMemo, useRef } from "react";

const defaultMethods: AlertMethods = {
  show: nope,
  clear: nope,
  showInfo: nope,
  showSuccess: nope,
  showWarning: nope,
  showError: nope,
  reportError: nope
};
const ctx = createContext<AlertMethods>(defaultMethods);

export const useAlert = () => useContext(ctx);

export const AlertProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const ref = useRef<AlertMethods>(null);
  const methods = useMemo<AlertMethods>(
    () => ({
      show: (alert) => ref.current?.show(alert),
      clear: () => ref.current?.clear(),
      showInfo: (message) => ref.current?.showInfo(message),
      showSuccess: (message) => ref.current?.showSuccess(message),
      showWarning: (message) => ref.current?.showWarning(message),
      showError: (message) => ref.current?.showError(message),
      reportError: (payload) => ref.current?.reportError(payload)
    }),
    []
  );
  return (
    <ctx.Provider value={methods}>
      {children}
      <GlobalAlert ref={ref} />
    </ctx.Provider>
  );
};
