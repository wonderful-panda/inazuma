import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { createWacher } from "./util";
import { useMemo } from "react";
import { serializeError } from "@/util";
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

/**
 * Loading
 */
const loadingAtom = atom(0);
const showLoadingAtom = atom(null, (_get, set) => set(loadingAtom, (prev) => prev + 1));
const hideLoadingAtom = atom(null, (_get, set) =>
  set(loadingAtom, (prev) => Math.max(prev - 1, 0))
);
const isLoadingAtom = atom((get) => get(loadingAtom) > 0);

export const useLoading = () => {
  const show = useSetAtom(showLoadingAtom, opt);
  const hide = useSetAtom(hideLoadingAtom, opt);
  return useMemo(() => ({ show, hide }), [show, hide]);
};

export const useIsLoadingValue = () => useAtomValue(isLoadingAtom, opt);

/**
 * Alert
 */
const alertAtom = atom<{ type: AlertType; message: string } | undefined>(undefined);
const reportErrorAtom = atom(null, (_get, set, payload: { error: unknown }) => {
  const error = serializeError(payload.error);
  set(alertAtom, { type: "error", message: `[${error.name}] ${error.message}` });
});

const showWarningAtom = atom(null, (_get, set, message: string) => {
  set(alertAtom, { type: "warning", message });
});
const showErrorAtom = atom(null, (_get, set, message: string) => {
  set(alertAtom, { type: "error", message });
});
const showSuccessAtom = atom(null, (_get, set, message: string) => {
  set(alertAtom, { type: "success", message });
});
const showInfoAtom = atom(null, (_get, set, message: string) => {
  set(alertAtom, { type: "info", message });
});

const hideAlertAtom = atom(null, (_get, set) => {
  set(alertAtom, undefined);
});

export const useAlertValue = () => useAtomValue(alertAtom, opt);
export const useReportError = () => useSetAtom(reportErrorAtom, opt);
export const useShowWarning = () => useSetAtom(showWarningAtom, opt);
export const useShowError = () => useSetAtom(showErrorAtom, opt);
export const useShowSuccess = () => useSetAtom(showSuccessAtom, opt);
export const useShowInfo = () => useSetAtom(showInfoAtom, opt);
export const useHideAlert = () => useSetAtom(hideAlertAtom, opt);
