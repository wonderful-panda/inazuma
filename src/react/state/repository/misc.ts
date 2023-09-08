import { atom, useSetAtom } from "jotai";
import { useMemo } from "react";

export const interactiveShellAtom = atom(false);

export const useInteractiveShell = () => {
  const setInteractiveShell = useSetAtom(interactiveShellAtom);
  return useMemo(
    () => ({
      show: () => setInteractiveShell(true),
      hide: () => setInteractiveShell(false),
      toggle: () => setInteractiveShell((prev) => !prev)
    }),
    [setInteractiveShell]
  );
};
