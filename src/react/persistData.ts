/*
 * load / save between sessionStorage and environment.json
 *
 * The reason why we don't use localStorege is localStorage prevents
 * multiple Electron instances run at same time.
 */
import { Environment } from "@/types/tauri-types";
import { invokeTauriCommand } from "./invokeTauriCommand";

export const STORAGE_PREFIX = "inazuma:";
export const loadStateToSessionStorage = async (env: Environment) => {
  const state = env.state;
  if (state) {
    Object.getOwnPropertyNames(state).forEach((key) => {
      sessionStorage.setItem(STORAGE_PREFIX + key, state[key]);
    });
  }
};

export const saveStateToEnvFile = async () => {
  const newState: Record<string, string> = {};
  for (let i = 0; i < sessionStorage.length; ++i) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      newState[key.slice(STORAGE_PREFIX.length)] = sessionStorage.getItem(key)!;
    }
  }
  await invokeTauriCommand("store_state", { newState });
};
