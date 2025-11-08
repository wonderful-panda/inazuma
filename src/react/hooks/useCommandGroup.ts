import { useContext } from "react";
import { CommandGroupContext, type CommandGroupMethods } from "@/context/CommandGroupContext";

export const useCommandGroup = (): CommandGroupMethods => {
  return useContext(CommandGroupContext);
};
