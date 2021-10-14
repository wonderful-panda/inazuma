import { CommandGroupContext, CommandGroupHandler } from "@/context/CommandGroupContext";
import { useContext } from "react";

export const useCommandGroup = (): CommandGroupHandler => {
  return useContext(CommandGroupContext);
};
