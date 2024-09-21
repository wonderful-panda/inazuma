import { createContext, useContext, useMemo, useRef } from "react";
import {
  AcceptButton,
  CancelButton,
  Dialog,
  DialogActions,
  DialogContent,
  type DialogMethods,
  DialogTitle
} from "@/components/Dialog";

export interface ConfirmDialogProps {
  title: string;
  content: React.ReactNode;
  buttons?: [string, string];
  defaultButton?: "accept" | "reject";
}

export type ConfirmDialogResult = "accepted" | "rejected" | "notready";

export interface ConfirmDialogMethods {
  showModal: (props: ConfirmDialogProps) => Promise<ConfirmDialogResult>;
}

const defaultMethods: ConfirmDialogMethods = {
  showModal: () => Promise.resolve("notready")
};

const ctx = createContext<ConfirmDialogMethods>(defaultMethods);

export const useConfirmDialog = () => useContext(ctx);

export const ConfirmDialogProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const ref = useRef<DialogMethods>(null);
  const methods = useMemo<ConfirmDialogMethods>(
    () => ({
      showModal: async ({ title, content, buttons = ["OK", "Cancel"], defaultButton }) => {
        if (!ref.current) {
          return Promise.resolve("notready");
        }
        const content_ = (
          <>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>{content}</DialogContent>
            <DialogActions>
              <AcceptButton
                key="1"
                text={buttons[0]}
                default={defaultButton !== "reject"}
                onClick={() => Promise.resolve(true)}
              />
              <CancelButton key="2" text={buttons[1]} default={defaultButton === "reject"} />
            </DialogActions>
          </>
        );
        const ret = await ref.current.showModal({ content: content_ });
        return ret.result;
      }
    }),
    []
  );
  return (
    <ctx.Provider value={methods}>
      <div className="flex flex-1">
        <Dialog ref={ref} />
        {children}
      </div>
    </ctx.Provider>
  );
};
