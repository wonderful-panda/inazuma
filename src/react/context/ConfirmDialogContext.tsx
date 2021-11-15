import ConfirmDialog from "@/components/ConfirmDialog";
import React, { createContext, useCallback, useMemo, useRef, useState } from "react";

export interface ConfirmDialogArgs {
  title?: string;
  content: React.ReactNode;
}

export interface ConfirmDialogMethods {
  show: (args: ConfirmDialogArgs) => Promise<boolean>;
}

export const ConfirmDialogContext = createContext<ConfirmDialogMethods>({
  show: () => Promise.resolve(false)
});

export const ConfirmDialogProvider: React.FC = ({ children }) => {
  const version = useRef(0);
  const [args, setArgs] = useState<ConfirmDialogArgs | undefined>(undefined);
  const [resolve_, setResolve] = useState<undefined | ((value: boolean) => void)>(undefined);
  const handleClose = useCallback(
    (value: boolean) => {
      const currentVersion = version.current;
      resolve_?.(value);
      setResolve(undefined);
      setTimeout(() => {
        // delay content cleanup until transition end
        if (version.current === currentVersion) {
          setArgs(undefined);
        }
      }, 500);
    },
    [resolve_]
  );
  const methods = useMemo(() => {
    return {
      show: (args: ConfirmDialogArgs) => {
        version.current = (version.current + 1) & 0xffff;
        return new Promise<boolean>((resolve) => {
          if (resolve_) {
            resolve_(false);
          }
          setArgs(args);
          setResolve(() => resolve);
        });
      }
    };
  }, [resolve_]);
  return (
    <ConfirmDialogContext.Provider value={methods}>
      {children}
      <ConfirmDialog opened={!!resolve_} {...args} onClose={handleClose} />
    </ConfirmDialogContext.Provider>
  );
};
