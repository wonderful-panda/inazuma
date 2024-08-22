import { atom, useAtom, useAtomValue } from "jotai";
import { createWacher } from "./util";
import { getRootStore } from "./rootStore";

const rootStore = getRootStore();
const opt = { store: rootStore };

/**
 * Config
 */
const configAtom = atom<Config>({
  fontFamily: {},
  fontSize: "medium",
  recentListCount: 10,
  avatarShape: "square",
  useGravatar: true
});
export const useConfig = () => useAtom(configAtom, opt);
export const useConfigValue = () => useAtomValue(configAtom, opt);

export const registerConfigWatcher = createWacher(configAtom, rootStore);

/**
 *  RecentOpenedRepositories
 */
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

export const useVisibleRecentOpenedRepositoriesValue = () =>
  useAtomValue(visibleRecentOpenedRepositoriesAtom, opt);

export const addRecentOpenedRepository = (path: string) =>
  rootStore.set(addRecentOpenedRepositoryAtom, path);
export const removeRecentOpenedRepository = (path: string) =>
  rootStore.set(removeRecentOpenedRepositoryAtom, path);
export const setRecentOpenedRepository = (paths: string[]) =>
  rootStore.set(recentOpenedRepositoriesAtom, paths);

export const registerRecentOpenedRepositoriesWatcher = createWacher(
  recentOpenedRepositoriesAtom,
  rootStore
);

export const setInitialValue = (config: Config, recentOpendRepositories: string[]) => {
  rootStore.set(configAtom, config);
  rootStore.set(recentOpenedRepositoriesAtom, recentOpendRepositories);
};
