import AutoSizer from "react-virtualized-auto-sizer";
import { memo, useCallback, useEffect, useRef } from "react";
import { useXterm } from "@/hooks/useXterm";
import { useReportError } from "@/state/root";

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
  const { open: openXterm, fit, changeFont, dispose } = useXterm({ onExit: hide });

  useEffect(() => dispose, [dispose]);

  useEffect(() => {
    fit();
  }, [width, height, fit]);

  const reportError = useReportError();
  const openShell = useCallback(async () => {
    try {
      await openXterm(wrapperRef.current!, {
        commandLine,
        cwd: repoPath,
        fontFamily,
        fontSize
      });
    } catch (error) {
      reportError({ error });
      hide();
    }
  }, [openXterm, hide, commandLine, repoPath, fontFamily, fontSize, reportError]);

  useEffect(() => {
    if (open) {
      openShell();
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
      className="position-relative flex-1 overflow-hidden p-0.5"
      style={{ width, height }}
      tabIndex={0}
    />
  );
};

const InteractiveShell_: React.FC<InteractiveShellProps> = (props) => {
  return (
    <AutoSizer className="flex-1">
      {(size) => <InteractiveShellInner {...props} {...size} />}
    </AutoSizer>
  );
};

export const InteractiveShell = memo(InteractiveShell_);
