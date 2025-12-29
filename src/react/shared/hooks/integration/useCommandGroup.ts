import { useContext } from "react";
import { CommandGroupContext, type CommandGroupMethods } from "@/core/context/CommandGroupContext";

export const useCommandGroup = (): CommandGroupMethods => {
  return useContext(CommandGroupContext);
};
