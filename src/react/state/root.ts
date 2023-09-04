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

export const useConfirmDialogValue = () => useAtomValue(confirmDialogAtom, opt);
export const useShowConfirmDialog = () => useSetAtom(showConfirmDialogAtom, opt);
export const useCloseConfirmDialog = () => useSetAtom(closeConfirmDialogAtom, opt);
