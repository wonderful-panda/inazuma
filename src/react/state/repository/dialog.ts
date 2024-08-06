import { wait } from "@/util";
import { atom } from "jotai";

export type DialogParam =
  | { type: "Commit" }
  | { type: "NewBranch"; commitId: string }
  | { type: "DeleteBranch"; branchName: string };

export interface DialogState {
  opened: boolean;
  param: DialogParam | undefined;
  version: number;
}

const _activeDialogAtom = atom<DialogState>({ version: 0, opened: false, param: undefined });
export const activeDialogAtom = atom((get) => get(_activeDialogAtom));

export const openDialogAtom = atom(null, (_get, set, payload: DialogParam) => {
  set(_activeDialogAtom, (prev) => {
    const version = (prev.version & 0xff) + 1;
    return {
      param: payload,
      opened: true,
      version
    };
  });
});

export const resetDialogAtom = atom(null, (_get, set) => {
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

export const closeDialogAtom = atom(null, async (get, set) => {
  const { version, opened } = get(activeDialogAtom);
  if (!opened) {
    return;
  }
  set(_closeDialogAtom);
  await wait(1000);
  set(_disposeDialogAtom, version);
});
