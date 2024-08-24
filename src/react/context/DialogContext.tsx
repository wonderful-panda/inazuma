import { Dialog, DialogMethods } from "@/components/Dialog";
import { createContext, useContext, useMemo, useRef } from "react";

const defaultMethods: DialogMethods = {
  showModal: () => Promise.resolve({ result: "notready" })
};
const ctx = createContext<DialogMethods>(defaultMethods);

export const useDialog = () => useContext(ctx);

export const DialogProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const ref = useRef<DialogMethods>(null);
  const methods = useMemo<DialogMethods>(
    () => ({
      showModal: (p) => (ref.current ?? defaultMethods).showModal(p)
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
