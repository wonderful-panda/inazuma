import { listen } from "@tauri-apps/api/event";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useCallback, useRef } from "react";
import { useAlert } from "@/core/context/AlertContext";
import { useConfigValue } from "@/core/state/root";
import { invokeTauriCommand } from "@/core/utils/invokeTauriCommand";
import { BOLD, CRLF, GREEN, RESET, ULINE, YELLOW } from "@/shared/utils/ansiEscape";
import { assertNever } from "@/shared/utils/util";

interface Shell {
  id: number;
  term: Terminal;
  fitAddon: FitAddon;
}

export type PtyId = number & { readonly _PtyId: unique symbol };

export type PtyExitStatus = "succeeded" | "failed";

export interface InteractiveShellOptions {
  openPty: (id: PtyId, rows: number, cols: number) => Promise<void>;
  onExit?: (status: PtyExitStatus) => Promise<void> | void;
  fontFamily: string;
  fontSize: number;
}

let currentPtyId = 0;

const getNextPtyId = () => {
  currentPtyId += 1;
  return currentPtyId as PtyId;
};

export const useXterm = () => {
  const shell = useRef<Shell | undefined>(undefined);
  const closePtyRef = useRef<(() => Promise<void>) | undefined>(undefined);

  const kill = useCallback(async () => {
    const closePty = closePtyRef.current;
    closePtyRef.current = undefined;
    await closePty?.();
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
      const term = new Terminal({ fontFamily, fontSize, theme: { background: "#0000" } });
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
        if (shell.current) {
          shell.current.id = -1;
        }
        setTimeout(() => {
          unlistenPtyData();
          void onExit?.(payload ? "succeeded" : "failed");
        }, 100); // sometimes pty-exit arrives before last pty-data.
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

  const write = (data: string) => shell.current?.term.write(data);
  const changeFont = useCallback((fontFamily: string, fontSize: number) => {
    if (shell.current) {
      shell.current.term.options.fontFamily = fontFamily;
      shell.current.term.options.fontSize = fontSize;
      shell.current.fitAddon.fit();
    }
  }, []);

  return { open, fit, write, changeFont, kill, dispose };
};

const useExecuteInXterm = <O>(
  openPty: (id: PtyId, rows: number, cols: number, options: O) => Promise<void>,
  showFinishBanner: boolean
) => {
  const xterm = useXterm();
  const alert = useAlert();
  const fontFamily = useConfigValue().fontFamily.monospace ?? "monospace";
  const runningRef = useRef(false);
  const execute = useCallback(
    (el: HTMLDivElement, options: O, callback: { onSucceeded: () => Promise<unknown> }) => {
      return new Promise<PtyExitStatus>((resolve) => {
        void xterm.open(el, {
          openPty: async (id, rows, cols) => {
            alert.clear();
            try {
              runningRef.current = true;
              return await openPty(id, rows, cols, options);
            } catch (e) {
              runningRef.current = false;
              throw e;
            }
          },
          fontFamily,
          fontSize: 16,
          onExit: async (status) => {
            switch (status) {
              case "succeeded":
                await callback.onSucceeded();
                if (showFinishBanner) {
                  xterm.write(CRLF + BOLD + ULINE + GREEN + "### FINISHED ###" + RESET + CRLF);
                }
                break;
              case "failed":
                if (showFinishBanner) {
                  alert.showWarning("Failed or Aborted.");
                  xterm.write(
                    CRLF + BOLD + ULINE + YELLOW + "### FAILED or ABORTED ###" + RESET + CRLF
                  );
                }
                break;
              default:
                assertNever(status);
                break;
            }
            runningRef.current = false;
            resolve(status);
          }
        });
      });
    },
    [xterm, fontFamily, alert, openPty, showFinishBanner]
  );
  const kill = useCallback(() => xterm.kill(), [xterm]);
  const isRunning = useCallback(() => runningRef.current, []);
  return { execute, kill, isRunning };
};

const executeGit = (
  id: PtyId,
  rows: number,
  cols: number,
  options: { command: string; args: string[]; repoPath?: string }
) =>
  invokeTauriCommand("exec_git_with_pty", {
    id,
    rows,
    cols,
    command: options.command,
    args: options.args,
    repoPath: options.repoPath
  });

export const useExecuteGitInXterm = () => useExecuteInXterm(executeGit, true);

const executeCustomCommand = (
  id: PtyId,
  rows: number,
  cols: number,
  options: { commandLine: string; repoPath: string }
) =>
  invokeTauriCommand("exec_custom_command_with_pty", {
    id,
    rows,
    cols,
    commandLine: options.commandLine,
    repoPath: options.repoPath
  });

export const useExecuteCustomCommandInXterm = () => useExecuteInXterm(executeCustomCommand, false);
