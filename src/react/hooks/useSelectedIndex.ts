import { useContext } from "react";
import { SelectedIndexContext } from "@/context/SelectedIndexContext";

export const useSelectedIndex = (): number => {
  return useContext(SelectedIndexContext);
};
