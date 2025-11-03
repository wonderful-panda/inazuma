import { DialogSection, LabelledCheckBox, LabelledRadio } from "../Dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAlert } from "@/context/AlertContext";
import { NativeSelect, RadioGroup } from "@mui/material";
import type { PtyExitStatus } from "@/hooks/useXterm";
import { XtermDialogBody } from "../XtermDialogBody";

type FetchMode = "selected" | "all";
export type FetchOptions = ({ type: "all" } | { type: "selected"; remote: string }) & {
  tags?: boolean;
};
const ModeRadio: React.FC<{
  value: FetchMode;
  label: React.ReactNode;
  disabled?: boolean;
}> = ({ value, label, disabled }) => {
  return <LabelledRadio value={value} label={label} disabled={disabled} />;
};

export const FetchDialogBody: React.FC<{
  remotes: readonly string[];
  openXterm: (el: HTMLDivElement, options: FetchOptions) => Promise<PtyExitStatus>;
  killPty: () => Promise<void>;
}> = ({ remotes, openXterm, killPty }) => {
  const alert = useAlert();
  const modeRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLInputElement | null>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<FetchMode>("all");

  const handleChangeMode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMode(e.target.value as FetchMode);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      modeRef.current?.querySelector<HTMLInputElement>("input[value='all']")?.focus();
    }, 0);
  }, []);

  const openXterm_ = useCallback(
    async (el: HTMLDivElement): Promise<PtyExitStatus> => {
      if (!remoteRef.current) {
        return "aborted";
      }
      if (mode !== "all" && !remoteRef.current.value) {
        alert.showWarning("Remote is not specified");
        return "aborted";
      }
      const tags = tagsRef.current?.checked;
      const opt = { type: mode, tags, remote: remoteRef.current.value };
      return await openXterm(el, opt);
    },
    [openXterm, alert, mode]
  );
  return (
    <XtermDialogBody
      title="Fetch changes from remote repository"
      openXterm={openXterm_}
      killPty={killPty}
    >
      <DialogSection label="Fetch from">
        <RadioGroup ref={modeRef} value={mode} onChange={handleChangeMode}>
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
      </DialogSection>
      <DialogSection label="Options">
        <LabelledCheckBox label="Fetch tags" inputRef={tagsRef} />
      </DialogSection>
    </XtermDialogBody>
  );
};
