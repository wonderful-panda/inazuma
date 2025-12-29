import { useCallback, useEffect, useRef, useState } from "react";
import type { PtyExitStatus } from "@/shared/hooks/shell/useXterm";
import {
  AcceptButton,
  CancelButton,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle
} from "@/shared/components/ui/Dialog";

export const XtermDialogBody: React.FC<{
  title: string;
  openXterm: (el: HTMLDivElement) => Promise<PtyExitStatus | "cancelled">;
  killPty: () => Promise<void>;
  startImmediate?: boolean;
  children: React.ReactNode;
}> = ({ title, openXterm, killPty, startImmediate, children }) => {
  const xtermRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"ready" | "running" | "succeeded" | "failed">("ready");

  const handleOk = useCallback(async (): Promise<boolean> => {
    if (!xtermRef.current) {
      return false;
    }
    setState("running");
    try {
      const ret = await openXterm(xtermRef.current);
      switch (ret) {
        case "cancelled":
          setState("ready");
          break;
        default:
          setState(ret);
          break;
      }
      return false;
    } catch (e) {
      setState("failed");
      throw e;
    }
  }, [openXterm]);
  useEffect(() => {
    if (startImmediate) {
      setTimeout(handleOk, 100);
    }
  }, [startImmediate, handleOk]);
  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <div className="m-0 flex flex-col-nowrap w-5xl">
          {children}
          <div
            ref={xtermRef}
            className="border border-highlight bg-console px-2 py-1 m-0 mt-2 h-96"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={handleOk} disabled={state !== "ready"} text="Execute" />
        <DialogButton onClick={killPty} disabled={state !== "running"} text="Abort" />
        <CancelButton text="Close" />
      </DialogActions>
    </>
  );
};
