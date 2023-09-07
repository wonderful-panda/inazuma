import { atom, useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";

const interactiveShellAtom = atom(false);

export const useInteractiveShellValue = () => useAtomValue(interactiveShellAtom);
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
