import { createContext } from "react";

export const SelectedIndexContext = createContext<number>(-1);

export const SelectedIndexProvider: React.FC<{
  value: number;
}> = ({ value, children }) => {
  return <SelectedIndexContext.Provider value={value}>{children}</SelectedIndexContext.Provider>;
};
