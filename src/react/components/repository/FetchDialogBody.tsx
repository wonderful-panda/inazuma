import {
  DialogContent,
  DialogTitle,
  DialogActions,
  AcceptButton,
  CancelButton,
  DialogButton
} from "../Dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAlert } from "@/context/AlertContext";
import { Checkbox, FormControlLabel, NativeSelect, Radio, RadioGroup } from "@mui/material";

type FetchMode = "selected" | "all";
export type FetchOptions = ({ type: "all" } | { type: "selected"; remote: string }) & {
  tags?: boolean;
};
const ModeRadio: React.FC<{
  value: FetchMode;
  label: React.ReactNode;
  disabled?: boolean;
}> = ({ value, label, disabled }) => {
  return (
    <FormControlLabel
      className="h-8"
      value={value}
      control={<Radio />}
      label={label}
      disabled={disabled}
    />
  );
};

export const FetchDialogBody: React.FC<{
  remotes: readonly string[];
  openXterm: (el: HTMLDivElement, options: FetchOptions) => Promise<boolean | "failed">;
  killPty: () => Promise<void>;
}> = ({ remotes, openXterm, killPty }) => {
  const alert = useAlert();
  const modeRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLInputElement>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const xtermRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<FetchMode>("all");
  const [running, setRunning] = useState(false);

  const handleChangeMode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMode(e.target.value as FetchMode);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      modeRef.current?.querySelector<HTMLInputElement>("input[value='all']")?.focus();
    }, 0);
  }, []);

  const handleOk = useCallback(async () => {
    if (!xtermRef.current || !remoteRef.current) {
      return false;
    }
    if (mode !== "all" && !remoteRef.current.value) {
      alert.showWarning("Remote is not specified");
      return false;
    }
    const tags = tagsRef.current?.checked;
    setRunning(true);
    try {
      const opt = { type: mode, tags, remote: remoteRef.current.value };
      return await openXterm(xtermRef.current, opt);
    } finally {
      setRunning(false);
    }
  }, [openXterm, alert, mode]);
  return (
    <>
      <DialogTitle>Fetch changes from remote repository</DialogTitle>
      <DialogContent>
        <div className="m-0 flex flex-col-nowrap w-[64rem]">
          <div className="text-primary">Fetch from</div>
          <RadioGroup ref={modeRef} className="ml-6 mb-4" value={mode} onChange={handleChangeMode}>
            <ModeRadio value="all" label="All remote repositories" />
            <ModeRadio
              value="selected"
              label={
                <NativeSelect
                  inputRef={remoteRef}
                  variant="standard"
                  inputProps={{ name: "remote", className: "min-w-80" }}
                  defaultValue={remotes[0]}
                  disabled={mode === "all"}
                >
                  {...remotes.map((r) => <option key={r}>{r}</option>)}
                </NativeSelect>
              }
            />
          </RadioGroup>
          <div className="text-primary">Options</div>
          <div className="ml-6">
            <FormControlLabel control={<Checkbox inputRef={tagsRef} />} label="Fetch tags" />
          </div>
          <div
            ref={xtermRef}
            className="border border-highlight bg-console px-2 py-1 m-0 mt-2 h-[24rem]"
          />
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={handleOk} disabled={running} text="Execute" />
        <DialogButton onClick={killPty} disabled={!running} text="Cancel" />
        <CancelButton text="Close" />
      </DialogActions>
    </>
  );
};