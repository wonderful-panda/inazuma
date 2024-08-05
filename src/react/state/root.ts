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

/**
 * ConfirmDialog
 */
type ConfirmDialogState = {
  title?: string;
  content?: React.ReactNode;
  status: "none" | "open" | "accepted" | "canceled";
};

type ConfirmDialogInnerState = {
  version: number;
  resolve?: (value: boolean) => void;
} & ConfirmDialogState;

const confirmDialogInnerAtom = atom<ConfirmDialogInnerState>({ version: 0, status: "none" });
const confirmDialogAtom = atom<ConfirmDialogState>((get) => {
  const { title, content, status } = get(confirmDialogInnerAtom);
  return { title, content, status };
});

const showConfirmDialogAtom = atom(
  null,
  (_get, set, update: { title?: string; content: React.ReactNode }) => {
    const promise = new Promise<boolean>((resolve) => {
      set(confirmDialogInnerAtom, (prev) => {
        if (prev.status === "open") {
          prev.resolve?.(false);
        }
        return { version: (prev.version + 1) & 0xff, resolve, status: "open", ...update };
      });
    });
    return promise;
  }
);

const closeConfirmDialogAtom = atom(null, (_get, set, accepted: boolean) => {
  let prevVersion = 0;
  set(confirmDialogInnerAtom, (prev) => {
    if (prev.status !== "open") {
      return prev;
    }
    prevVersion = prev.version;
    prev.resolve?.(accepted);
    return { ...prev, resolve: undefined, status: accepted ? "accepted" : "canceled" };
  });

  // title and content will be cleared after a while
  // (to avoid layout collaption during closing transision)
  setTimeout(() => {
    set(confirmDialogInnerAtom, (prev) => {
      if (prev.version !== prevVersion) {
        return prev;
      }
      return { version: prev.version, status: prev.status };
    });
  }, 1000);
});

export const useConfirmDialogValue = () => useAtomValue(confirmDialogAtom, opt);
export const useShowConfirmDialog = () => useSetAtom(showConfirmDialogAtom, opt);
export const useCloseConfirmDialog = () => useSetAtom(closeConfirmDialogAtom, opt);

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
