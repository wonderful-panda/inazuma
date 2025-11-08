import { memo, useCallback, useEffect, useRef, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { useAlert } from "@/context/AlertContext";
import { type PtyExitStatus, type PtyId, useXterm } from "@/hooks/useXterm";
import { invokeTauriCommand } from "@/invokeTauriCommand";

export interface InteractiveShellProps {
  open: boolean;
  commandLine: string;
  hide: () => void;
  repoPath: string;
  fontFamily?: string;
  fontSize?: number;
}

const InteractiveShellInner: React.FC<
  InteractiveShellProps & { width: number; height: number }
> = ({
  open,
  commandLine,
  hide,
  repoPath,
  fontFamily = "monospace",
  fontSize = 16,
  width,
  height
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const handleExit = useCallback(
    (status: PtyExitStatus) => {
      console.log("pty-result:", status);
      hide();
    },
    [hide]
  );
  const { open: openXterm, fit, changeFont, dispose } = useXterm();

  useEffect(() => () => void dispose(), [dispose]);

  // biome-ignore lint/correctness/useExhaustiveDependencies(width): width and height changes should trigger terminal resize
  // biome-ignore lint/correctness/useExhaustiveDependencies(height): width and height changes should trigger terminal resize
  useEffect(() => {
    if (open) {
      fit();
    }
  }, [width, height, fit, open]);

  const { reportError } = useAlert();
  const openShell = useCallback(async () => {
    const openPty = (id: PtyId, rows: number, cols: number) =>
      invokeTauriCommand("open_pty", { id, commandLine, cwd: repoPath, rows, cols });
    try {
      await openXterm(wrapperRef.current!, {
        openPty,
        fontFamily,
        fontSize,
        onExit: handleExit
      });
    } catch (error) {
      reportError({ error });
      hide();
    }
  }, [openXterm, hide, commandLine, repoPath, fontFamily, fontSize, handleExit, reportError]);

  useEffect(() => {
    if (open) {
      void openShell();
      // don't dispose on cleanup.
      // keep shell opened during hidden.
    }
  }, [open, openShell]);

  useEffect(() => {
    changeFont(fontFamily, fontSize);
  }, [changeFont, fontFamily, fontSize]);

  return (
    <div
      ref={wrapperRef}
      className="relative flex-1 overflow-hidden border border-paper bg-console px-2 py-1 m-2"
    />
  );
};

const nope = () => <></>;

const InteractiveShell_: React.FC<InteractiveShellProps> = (props) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  // AutoSizer's children will be unmounted during 'display:none'.
  // InteractiveShellInner must be kept mounted, so we put it out of AutoSizer.
  return (
    <>
      <InteractiveShellInner {...props} {...size} />
      <AutoSizer className="absolute flex-1" onResize={setSize}>
        {nope}
      </AutoSizer>
    </>
  );
};

export const InteractiveShell = memo(InteractiveShell_);
