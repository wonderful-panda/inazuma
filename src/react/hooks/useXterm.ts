import { invokeTauriCommand } from "@/invokeTauriCommand";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useWithRef } from "./useWithRef";

interface Shell {
  id: number;
  term: Terminal;
  fitAddon: FitAddon;
}

export interface InteractiveShellOptions {
  openPty: (rows: number, cols: number) => Promise<number>;
  fontFamily: string;
  fontSize: number;
}

export const useXterm = (options: { onExit?: (succeeded: boolean) => void }) => {
  const shell = useRef<Shell>();
  const [, onExitRef] = useWithRef(options.onExit);
  const closePtyRef = useRef<() => Promise<void>>();
  const disconnectRef = useRef<() => void>();

  const disconnect = useCallback(() => {
    disconnectRef.current?.();
    disconnectRef.current = undefined;
    if (shell.current) {
      shell.current.id = -1;
    }
  }, []);

  const kill = useCallback(() => {
    disconnect();
    void closePtyRef.current?.();
    closePtyRef.current = undefined;
  }, [disconnect]);

  const dispose = useCallback(() => {
    kill();
    shell.current?.fitAddon.dispose();
    shell.current?.term.dispose();
    shell.current = undefined;
  }, [kill]);

  const open = useCallback(
    async (el: HTMLDivElement, { openPty, fontFamily, fontSize }: InteractiveShellOptions) => {
      if (shell.current && 0 < shell.current.id) {
        shell.current.term.focus();
        return;
      }
      dispose();
      const term = new Terminal({ fontFamily, fontSize });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(el);
      fitAddon.fit();
      const id = await openPty(term.rows, term.cols);

      closePtyRef.current = () => invokeTauriCommand("close_pty", { id });
      const unlistenPtyData = await listen<string>(`pty-data:${id}`, ({ payload }) =>
        term.write(payload)
      );
      const unlistenPtyExit = await listen<boolean>(`pty-exit:${id}`, ({ payload }) => {
        closePtyRef.current = undefined;
        disconnect();
        onExitRef.current?.(payload);
      });
      const onDataDisposer = term.onData((data) => invokeTauriCommand("write_pty", { id, data }));
      const onResizeDisposer = term.onResize(({ rows, cols }) =>
        invokeTauriCommand("resize_pty", { id, rows, cols })
      );

      disconnectRef.current = () => {
        unlistenPtyData();
        unlistenPtyExit();
        onDataDisposer.dispose();
        onResizeDisposer.dispose();
      };
      term.focus();
      shell.current = { id, term, fitAddon };
    },
    [dispose, kill, onExitRef]
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
