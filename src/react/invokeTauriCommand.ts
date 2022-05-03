import { invoke } from "@tauri-apps/api";
import { TauriInvoke } from "./types/tauri-types";

export const invokeTauriCommand: TauriInvoke = (command, ...args: any[]) => {
  console.debug(command, args);
  return invoke(command, ...args);
};
