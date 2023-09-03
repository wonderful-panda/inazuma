import { atom, useAtom, useAtomValue, createStore, useSetAtom, Atom } from "jotai";

export type Store = ReturnType<typeof createStore>;
const rootStore = createStore();
const opt = { store: rootStore };

const configAtom = atom<Config>({
  fontFamily: {},
  fontSize: "medium",
  recentListCount: 10
});

const recentOpenedRepositoriesAtom = atom<string[]>([]);

const visibleRecentOpenedRepositoriesAtom = atom((get) => {
  const maxCount = get(configAtom).recentListCount;
  return get(recentOpenedRepositoriesAtom).slice(0, maxCount);
});

const addRecentOpenedRepositoryAtom = atom(null, (_get, set, repositoryPath: string) => {
  set(recentOpenedRepositoriesAtom, (prev) => [
    repositoryPath,
    ...prev.filter((v) => v !== repositoryPath)
  ]);
});

const removeRecentOpenedRepositoryAtom = atom(null, (_get, set, repositoryPath: string) => {
  set(recentOpenedRepositoriesAtom, (prev) => prev.filter((v) => v !== repositoryPath));
});

const createWacher =
  <T>(atom: Atom<T>, store: Store) =>
  (handler: (value: T) => void) => {
    return rootStore.sub(atom, () => {
      const value = store.get(atom);
      handler(value);
    });
  };

export const useConfig = () => useAtom(configAtom, opt);
export const useConfigValue = () => useAtomValue(configAtom, opt);

export const registerConfigWatcher = createWacher(configAtom, rootStore);

export const useVisibleRecentOpenedRepositoriesValue = () =>
  useAtomValue(visibleRecentOpenedRepositoriesAtom, opt);
export const useAddRecentOpenedRepository = () => useSetAtom(addRecentOpenedRepositoryAtom, opt);
export const useRemoveRecentOpenedRepository = () =>
  useSetAtom(removeRecentOpenedRepositoryAtom, opt);
export const useSetRecentOpenedRepositories = () => useSetAtom(recentOpenedRepositoriesAtom, opt);

export const registerRecentOpenedRepositoriesWatcher = createWacher(
  recentOpenedRepositoriesAtom,
  rootStore
);
