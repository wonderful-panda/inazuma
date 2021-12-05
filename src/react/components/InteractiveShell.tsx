import AutoSizer from "react-virtualized-auto-sizer";
import { memo, useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { REPORT_ERROR } from "@/store/misc";

type Shell = {
  ptyCommands: { [K in keyof PtyCommands]: (payload: PtyCommands[K]) => Promise<void> };
  term: Terminal;
  fitAddon: FitAddon;
};

export interface InteractiveShellProps {
  open: boolean;
  cmd: string;
  hide: () => {};
  args?: string[];
  cwd?: string;
  fontFamily?: string;
  fontSize?: number;
}

export interface InteractiveShellMethods {
  fit: () => void;
}

const InteractiveShellInner: React.VFC<
  InteractiveShellProps & { width: number; height: number }
> = ({
  open,
  cmd,
  hide,
  args = [],
  cwd = ".",
  fontFamily = "monospace",
  fontSize = 16,
  width,
  height
}) => {
  const dispatch = useDispatch();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const shell = useRef<Shell>();
  const fit = useCallback(() => {
    if (!shell.current) {
      return;
    }
    const { fitAddon, term } = shell.current;
    fitAddon.fit();
    term.refresh(0, term.rows - 1);
  }, []);

  useEffect(() => {
    fit();
  }, [width, height, fit]);

  const openShell = useCallback(async () => {
    if (shell.current) {
      shell.current.term.focus();
      return;
    }
    try {
      const term = new Terminal({ fontFamily, fontSize });
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      const options: OpenPtyOptions = { file: cmd, args, cwd };
      const listeners: PtyListeners = {
        onData: (data) => term.write(data),
        onExit: () => {
          term.dispose();
          fitAddon.dispose();
          shell.current = undefined;
          hide();
        }
      };
      const ptyCommands = await window.pty.open(options, listeners);
      term.onData(ptyCommands.data);
      term.onResize(ptyCommands.resize);
      shell.current = { ptyCommands, term, fitAddon };
      term.onKey(({ domEvent }) => {
        if (domEvent.code === "Escape") {
          wrapperRef.current?.focus();
        }
      });

      term.open(wrapperRef.current!);
      fitAddon.fit();
      term.focus();
    } catch (error) {
      dispatch(REPORT_ERROR({ error }));
      hide();
    }
  }, [cmd, args, cwd, hide, fontFamily, fontSize, dispatch]);

  useEffect(() => {
    if (open) {
      openShell();
      // don't terminate on cleanup.
      // keep shell instance during hidden.
    }
  }, [open, openShell]);

  useEffect(() => {
    // terminate shell when unmounted
    const terminateShell = () => {
      if (!shell.current) {
        return;
      }
      shell.current.ptyCommands.kill({});
      shell.current = undefined;
    };
    return terminateShell;
  }, []);

  useEffect(() => {
    shell.current?.term.setOption("fontFamily", fontFamily);
    shell.current?.term.setOption("fontSize", fontSize);
  }, [fontFamily, fontSize]);

  return (
    <div
      ref={wrapperRef}
      className="position-relative flex-1 overflow-hidden p-0.5"
      style={{ width, height }}
      tabIndex={0}
    />
  );
};

const InteractiveShell_: React.VFC<InteractiveShellProps> = (props) => {
  return (
    <AutoSizer className="flex-1">
      {(size) => <InteractiveShellInner {...props} {...size} />}
    </AutoSizer>
  );
};

export const InteractiveShell = memo(InteractiveShell_);
