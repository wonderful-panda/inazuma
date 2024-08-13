import { atom } from "jotai";

export const interactiveShellAtom = atom(false);

export const showInteractiveShellAtom = atom(null, (_get, set) => set(interactiveShellAtom, true));

export const hideInteractiveShellAtom = atom(null, (_get, set) => set(interactiveShellAtom, false));
export const toggleInteractiveShellAtom = atom(null, (_get, set) =>
  set(interactiveShellAtom, (prev) => !prev)
);

export const reflogAtom = atom(false);
export const toggleReflogAtom = atom(null, (_get, set) => set(reflogAtom, (prev) => !prev));

export const pinnedCommitAtom = atom<Commit | undefined>(undefined);
