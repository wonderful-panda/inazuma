import { invoke } from "@tauri-apps/api/core";
import { TauriInvoke } from "./generated/tauri-invoke";

export const invokeTauriCommand: TauriInvoke = (command, ...args: any[]) => {
  console.debug(command, args);
  return invoke(command, ...args);
};
