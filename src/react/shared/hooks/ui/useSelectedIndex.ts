import { useContext } from "react";
import { SelectedIndexContext } from "@/core/context/SelectedIndexContext";

export const useSelectedIndex = (): number => {
  return useContext(SelectedIndexContext);
};
