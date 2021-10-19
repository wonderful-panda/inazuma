import { CommandGroupContext, CommandGroupMethods } from "@/context/CommandGroupContext";
import { useContext } from "react";

export const useCommandGroup = (): CommandGroupMethods => {
  return useContext(CommandGroupContext);
};
