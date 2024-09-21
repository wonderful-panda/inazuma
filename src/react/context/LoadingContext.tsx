import { FullscreenLoading, type FullscreenLoadingMethods } from "@/components/Loading";
import { nope } from "@/util";
import { createContext, useContext, useMemo, useRef } from "react";

const defaultMethods: FullscreenLoadingMethods = {
  show: nope,
  hide: nope
};
const ctx = createContext<FullscreenLoadingMethods>(defaultMethods);

export const useLoading = () => useContext(ctx);

export const LoadingProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const ref = useRef<FullscreenLoadingMethods>(null);
  const methods = useMemo<FullscreenLoadingMethods>(
    () => ({
      show: () => (ref.current ?? defaultMethods).show(),
      hide: () => (ref.current ?? defaultMethods).hide()
    }),
    []
  );
  return (
    <ctx.Provider value={methods}>
      <div className="flex flex-1">
        <FullscreenLoading ref={ref} />
        {children}
      </div>
    </ctx.Provider>
  );
};
