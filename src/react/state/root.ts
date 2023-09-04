import { atom, useAtom, useAtomValue, createStore, useSetAtom } from "jotai";
import { createWacher } from "./util";

const rootStore = createStore();
const opt = { store: rootStore };

/**
 * Config
 */
const configAtom = atom<Config>({
  fontFamily: {},
  fontSize: "medium",
  recentListCount: 10
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
export const useAddRecentOpenedRepository = () => useSetAtom(addRecentOpenedRepositoryAtom, opt);
export const useRemoveRecentOpenedRepository = () =>
  useSetAtom(removeRecentOpenedRepositoryAtom, opt);
export const useSetRecentOpenedRepositories = () => useSetAtom(recentOpenedRepositoriesAtom, opt);

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

const closeConfirmDialogAtom = atom(null, (get, set, accepted: boolean) => {
  const prev = get(confirmDialogInnerAtom);
  if (prev.status !== "open") {
    return;
  }
  prev.resolve?.(accepted);
  set(confirmDialogInnerAtom, {
    ...prev,
    resolve: undefined,
    status: accepted ? "accepted" : "canceled"
  });
  // title and content will be cleared after a while
  // (to avoid layout collaption during closing transision)
  setTimeout(() => {
    const cur = get(confirmDialogInnerAtom);
    if (cur.version === prev.version) {
      set(confirmDialogInnerAtom, { version: cur.version, status: cur.status });
    }
  }, 1000);
});

export const useConfirmDialogValue = () => useAtomValue(confirmDialogAtom, opt);
export const useShowConfirmDialog = () => useSetAtom(showConfirmDialogAtom, opt);
export const useCloseConfirmDialog = () => useSetAtom(closeConfirmDialogAtom, opt);
