import { invokeTauriCommand } from "@/invokeTauriCommand";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

interface Shell {
  id: number;
  term: Terminal;
  fitAddon: FitAddon;
}

export interface InteractiveShellOptions {
  commandLine: string;
  cwd: string;
  fontFamily: string;
  fontSize: number;
}

export const useXterm = (options: { onExit?: () => void }) => {
  const shell = useRef<Shell>();
  const onExitRef = useRef<() => void>();
  const unlistenPtyData = useRef<() => void>();
  const unlistenPtyExit = useRef<() => void>();

  onExitRef.current = options.onExit;

  const dispose = useCallback(() => {
    unlistenPtyData.current?.();
    unlistenPtyData.current = undefined;
    unlistenPtyExit.current?.();
    unlistenPtyExit.current = undefined;
    shell.current?.fitAddon.dispose();
    shell.current?.term.dispose();
    shell.current = undefined;
  }, []);

  const open = useCallback(
    async (
      el: HTMLDivElement,
      { commandLine, cwd, fontFamily, fontSize }: InteractiveShellOptions
    ) => {
      if (shell.current) {
        shell.current.term.focus();
        return;
      }
      dispose();
      const term = new Terminal({ fontFamily, fontSize });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(el);
      fitAddon.fit();
      const id = await invokeTauriCommand("open_pty", {
        commandLine,
        cwd,
        rows: term.rows,
        cols: term.cols
      });
      unlistenPtyData.current = await listen<string>(`pty-data:${id}`, ({ payload }) =>
        term.write(payload)
      );
      unlistenPtyData.current = await listen<string>(`pty-exit:${id}`, () => {
        dispose();
        onExitRef.current?.();
      });
      term.onData((data) => invokeTauriCommand("write_pty", { id, data }));
      term.onResize(({ rows, cols }) => invokeTauriCommand("resize_pty", { id, rows, cols }));
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
    }
  }, []);

  return { open, fit, changeFont, dispose };
};
