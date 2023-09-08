import { wait } from "@/util";
import { atom } from "jotai";
import { DialogParam, activeDialogAtom } from "./premitive";

export const openDialogAtom = atom(null, (_get, set, payload: DialogParam) => {
  set(activeDialogAtom, (prev) => {
    const version = (prev.version & 0xff) + 1;
    return {
      param: payload,
      opened: true,
      version
    };
  });
});

const _closeDialogAtom = atom(null, (_get, set) => {
  set(activeDialogAtom, (prev) => {
    return {
      ...prev,
      opened: false
    };
  });
});

const _disposeDialogAtom = atom(null, (_get, set, version: number) => {
  set(activeDialogAtom, (prev) => {
    if (prev.version !== version) {
      return prev;
    } else {
      return { opened: false, version, param: undefined };
    }
  });
});

export const closeDialogAtom = atom(null, async (get, set) => {
  const { version, opened } = get(activeDialogAtom);
  if (!opened) {
    return;
  }
  set(_closeDialogAtom);
  await wait(1000);
  set(_disposeDialogAtom, version);
});
