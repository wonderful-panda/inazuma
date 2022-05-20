import { invoke } from "@tauri-apps/api";

export const invokeTauriCommand: TauriInvoke = (command, ...args: any[]) => {
  console.debug(command, args);
  return invoke(command, ...args);
};
