import { invoke } from "@tauri-apps/api/core";
import type { TauriInvoke } from "./generated/tauri-invoke";

export const invokeTauriCommand = ((command: string, ...args: never[]) => {
  console.debug(command, args);
  return invoke(command, ...args);
}) as TauriInvoke;
