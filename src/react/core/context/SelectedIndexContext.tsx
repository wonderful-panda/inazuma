import { createContext, type PropsWithChildren } from "react";

export const SelectedIndexContext = createContext<number>(-1);

export const SelectedIndexProvider: React.FC<
  PropsWithChildren<{
    value: number;
  }>
> = ({ value, children }) => {
  return <SelectedIndexContext.Provider value={value}>{children}</SelectedIndexContext.Provider>;
};
