import { SelectedIndexContext } from "@/context/SelectedIndexContext";
import { useContext } from "react";

export const useSelectedIndex = (): number => {
  return useContext(SelectedIndexContext);
};
