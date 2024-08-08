import { wait } from "@/util";
import { atom } from "jotai";

export interface DialogState<T> {
  opened: boolean;
  param: T | undefined;
  version: number;
}

export const createDialogAtoms = <T>() => {
  const _activeDialogAtom = atom<DialogState<T>>({ version: 0, opened: false, param: undefined });
  const activeDialogAtom = atom((get) => get(_activeDialogAtom));

  const openDialogAtom = atom(null, (_get, set, payload: T) => {
    set(_activeDialogAtom, (prev) => {
      const version = (prev.version & 0xff) + 1;
      return {
        param: payload,
        opened: true,
        version
      };
    });
  });

  const resetDialogAtom = atom(null, (_get, set) => {
    set(_activeDialogAtom, { opened: false, param: undefined, version: 0 });
  });

  const _closeDialogAtom = atom(null, (_get, set) => {
    set(_activeDialogAtom, (prev) => {
      return {
        ...prev,
        opened: false
      };
    });
  });

  const _disposeDialogAtom = atom(null, (_get, set, version: number) => {
    set(_activeDialogAtom, (prev) => {
      if (prev.version !== version) {
        return prev;
      } else {
        return { opened: false, version, param: undefined };
      }
    });
  });

  const closeDialogAtom = atom(null, async (get, set) => {
    const { version, opened } = get(activeDialogAtom);
    if (!opened) {
      return;
    }
    set(_closeDialogAtom);
    await wait(1000);
    set(_disposeDialogAtom, version);
  });
  return {
    activeDialogAtom,
    openDialogAtom,
    closeDialogAtom,
    resetDialogAtom
  };
};
