import { invokeTauriCommand } from "@/invokeTauriCommand";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useWithRef } from "./useWithRef";
import { useReloadRepository } from "./actions/openRepository";
import { useAlert } from "@/context/AlertContext";
import { assertNever } from "@/util";
import { BOLD, CRLF, RESET, ULINE, YELLOW } from "@/ansiEscape";
import { useConfigValue } from "@/state/root";

interface Shell {
  id: number;
  term: Terminal;
  fitAddon: FitAddon;
  killed: boolean;
}

export type PtyId = number & { readonly _PtyId: unique symbol };

export type PtyExitStatus = "succeeded" | "failed" | "aborted";

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
  const shell = useRef<Shell>();
  const closePtyRef = useRef<() => Promise<void>>();

  const kill = useCallback(async () => {
    const closePty = closePtyRef.current;
    closePtyRef.current = undefined;
    if (closePty) {
      if (shell.current) {
        shell.current.killed = true;
      }
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
          void onExit?.(shell.current?.killed ? "aborted" : payload ? "succeeded" : "failed");
        }, 100); // sometimes pty-exit arrives before last pty-data.
      });
      await openPty(id, term.rows, term.cols);
      term.focus();
      shell.current = { id, term, fitAddon, killed: false };
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

export const useExecuteGitInXterm = () => {
  const xterm = useXterm();
  const alert = useAlert();
  const fontFamily = useConfigValue().fontFamily.monospace ?? "monospace";
  const [, reloadRepositoryRef] = useWithRef(useReloadRepository());
  const execute = useCallback(
    (
      el: HTMLDivElement,
      options: {
        command: string;
        args: string[];
        repoPath?: string;
        onSucceeded?: () => Promise<unknown>;
      }
    ) => {
      return new Promise<boolean>((resolve) => {
        void xterm.open(el, {
          openPty: (id, rows, cols) => {
            alert.clear();
            return invokeTauriCommand("exec_git_with_pty", {
              id,
              command: options.command,
              args: options.args,
              repoPath: options.repoPath,
              rows,
              cols
            });
          },
          fontFamily,
          fontSize: 16,
          onExit: async (status) => {
            switch (status) {
              case "succeeded":
                await (options.onSucceeded ?? reloadRepositoryRef.current)?.();
                break;
              case "failed":
                alert.showError("Failed.");
                xterm.write(CRLF + BOLD + ULINE + YELLOW + "### FAILED ###" + RESET + CRLF);
                break;
              case "aborted":
                alert.showWarning("Cancelled.");
                xterm.write(CRLF + BOLD + ULINE + YELLOW + "### CANCELLED ###" + RESET + CRLF);
                break;
              default:
                assertNever(status);
                break;
            }
            resolve(status === "succeeded");
          }
        });
      });
    },
    [xterm, fontFamily, alert]
  );
  const kill = useCallback(() => xterm.kill(), [xterm]);
  return { execute, kill };
};
