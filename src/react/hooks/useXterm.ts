import { invokeTauriCommand } from "@/invokeTauriCommand";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

interface Shell {
  id: number;
  term: Terminal;
  fitAddon: FitAddon;
}

export type PtyId = number & { readonly _PtyId: unique symbol };

export interface InteractiveShellOptions {
  openPty: (id: PtyId, rows: number, cols: number) => Promise<void>;
  onExit?: (succeeded: boolean) => Promise<void> | void;
  fontFamily: string;
  fontSize: number;
}

let currentPtyId = 0;

const getNextPtyId = () => {
  currentPtyId += 1;
  return currentPtyId as PtyId;
};

export const useXterm = () => {
  const shell = useRef<Shell>();
  const closePtyRef = useRef<() => Promise<void>>();

  const kill = useCallback(async () => {
    const closePty = closePtyRef.current;
    closePtyRef.current = undefined;
    if (closePty) {
      await closePty();
    }
  }, []);

  const dispose = useCallback(async () => {
    await kill();
    shell.current?.fitAddon.dispose();
    shell.current?.term.dispose();
    shell.current = undefined;
  }, [kill]);

  const open = useCallback(
    async (
      el: HTMLDivElement,
      { openPty, fontFamily, fontSize, onExit }: InteractiveShellOptions
    ) => {
      if (shell.current && 0 < shell.current.id) {
        shell.current.term.focus();
        return;
      }
      await dispose();
      const term = new Terminal({ fontFamily, fontSize });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(el);
      fitAddon.fit();
      const id = getNextPtyId();

      const onDataDisposer = term.onData((data) => invokeTauriCommand("write_pty", { id, data }));
      const onResizeDisposer = term.onResize(({ rows, cols }) =>
        invokeTauriCommand("resize_pty", { id, rows, cols })
      );
      closePtyRef.current = () => invokeTauriCommand("close_pty", { id });
      const unlistenPtyData = await listen<string>(`pty-data:${id}`, ({ payload }) =>
        term.write(payload)
      );
      const unlistenPtyExit = await listen<boolean>(`pty-exit:${id}`, ({ payload }) => {
        closePtyRef.current = undefined;
        onDataDisposer.dispose();
        onResizeDisposer.dispose();
        unlistenPtyExit();
        setTimeout(unlistenPtyData, 100); // sometimes pty-exit is received before last pty-data.
        if (shell.current) {
          shell.current.id = -1;
        }
        void onExit?.(payload);
      });
      await openPty(id, term.rows, term.cols);
      term.focus();
      shell.current = { id, term, fitAddon };
    },
    [dispose]
  );

  const fit = useCallback(() => {
    if (shell.current) {
      const { fitAddon, term } = shell.current;
      fitAddon.fit();
      term.refresh(0, term.rows - 1);
    }
  }, []);

  const changeFont = useCallback((fontFamily: string, fontSize: number) => {
    if (shell.current) {
      shell.current.term.options.fontFamily = fontFamily;
      shell.current.term.options.fontSize = fontSize;
      shell.current.fitAddon.fit();
    }
  }, []);

  return { open, fit, changeFont, kill, dispose };
};
