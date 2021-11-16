import dispatchBrowser from "./dispatchBrowser";
/*
 * load / save between sessionStorage and environment.json
 *
 * The reason why we don't use localStorege is localStorage prevents
 * multiple Electron instances run at same time.
 */

export const persistDataPromise = dispatchBrowser("loadPersistentData");

export const STORAGE_PREFIX = "inazuma:";
export const loadStateToSessionStorage = async () => {
  const {
    environment: { state }
  } = await persistDataPromise;
  if (state) {
    Object.getOwnPropertyNames(state).forEach((key) => {
      sessionStorage.setItem(STORAGE_PREFIX + key, state[key]);
    });
  }
};

export const saveStateToEnvFile = async () => {
  const state: Record<string, string> = {};
  for (let i = 0; i < sessionStorage.length; ++i) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      state[key.slice(STORAGE_PREFIX.length)] = sessionStorage.getItem(key)!;
    }
  }
  dispatchBrowser("saveEnvironment", "state", state);
};
