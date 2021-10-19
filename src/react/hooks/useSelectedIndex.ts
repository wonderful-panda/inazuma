import {
  SelectedIndexContext,
  SelectedIndexMethods,
  SelectedIndexMethodsContext
} from "@/context/SelectedIndexContext";
import { useContext } from "react";

export const useSelectedIndex = (): number => {
  return useContext(SelectedIndexContext);
};

export const useSelectedIndexMethods = (): SelectedIndexMethods => {
  return useContext(SelectedIndexMethodsContext);
};
