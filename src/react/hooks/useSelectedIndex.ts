import {
  SelectedIndexContext,
  SelectedIndexHandler,
  SetSelectedIndexContext
} from "@/context/SelectedIndexContext";
import { useContext } from "react";

export const useSelectedIndex = (): number => {
  return useContext(SelectedIndexContext);
};

export const useSelectedIndexHandler = (): SelectedIndexHandler => {
  return useContext(SetSelectedIndexContext);
};
