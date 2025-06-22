import {
  DialogContent,
  DialogTitle,
  DialogActions,
  AcceptButton,
  CancelButton,
  DialogButton,
  DialogSection,
  LabelledCheckBox,
  LabelledRadio
} from "../Dialog";
import { useCallback, useRef, useState } from "react";
import { useAlert } from "@/context/AlertContext";
import { NativeSelect, RadioGroup } from "@mui/material";
import { Icon } from "../Icon";

type PullMode = "--no-ff" | "--ff" | "--ff-only" | "--rebase";
export interface PullOptions {
  mode: PullMode;
  remote: string;
  tags?: boolean;
  autoStash?: boolean;
}

const ModeRadio: React.FC<{
  value: PullMode;
  label: string;
  disabled?: boolean;
}> = ({ value, label, disabled }) => {
  return (
    <LabelledRadio
      value={value}
      label={
        <span>
          <span>{label}</span>
          <span className="ml-4 text-greytext font-mono">({value})</span>
        </span>
      }
      disabled={disabled}
    />
  );
};

export const PullDialogBody: React.FC<{
  remotes: readonly string[];
  openXterm: (el: HTMLDivElement, options: PullOptions) => Promise<boolean | "failed">;
  killPty: () => Promise<void>;
}> = ({ remotes, openXterm, killPty }) => {
  const alert = useAlert();
  const modeRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLInputElement | null>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const autoStashRef = useRef<HTMLInputElement>(null);
  const xtermRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<PullMode>("--ff");
  const [running, setRunning] = useState(false);

  const handleChangeMode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMode(e.target.value as PullMode);
  }, []);

  const handleOk = useCallback(async (): Promise<boolean> => {
    if (!xtermRef.current || !remoteRef.current) {
      return false;
    }
    const remote = remoteRef.current.value;
    const tags = tagsRef.current?.checked;
    const autoStash = autoStashRef.current?.checked;
    if (!remote) {
      alert.showWarning("Remote is not specified");
      return false;
    }
    setRunning(true);
    try {
      await openXterm(xtermRef.current, { mode, remote, tags, autoStash });
      return false;
    } finally {
      setRunning(false);
    }
  }, [openXterm, alert, mode]);
  return (
    <>
      <DialogTitle>Pull(fetch and merge) changes from remote repository</DialogTitle>
      <DialogContent>
        <div className="m-0 flex flex-col-nowrap w-[64rem]">
          <DialogSection label="Pull from">
            <div className="flex-row-nowrap">
              <Icon icon="mdi:web" className="mr-2 my-auto text-2xl" />
              <NativeSelect
                inputRef={remoteRef}
                variant="standard"
                inputProps={{ name: "remote", className: "min-w-80" }}
              >
                {remotes.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </DialogSection>
          <DialogSection label="Mode">
            <RadioGroup ref={modeRef} defaultValue="--ff" onChange={handleChangeMode}>
              <ModeRadio
                value="--no-ff"
                label="Create merge commit always, even if fast-forward merge is possible"
              />
              <ModeRadio value="--ff" label="Do fast-forward merge if possible" />
              <ModeRadio
                value="--ff-only"
                label="Do only fast-forward merge, fail if fast-forward merge is not possible"
              />
              <ModeRadio value="--rebase" label="Rebase local changes onto upstream changes" />
            </RadioGroup>
          </DialogSection>
          <DialogSection label="Options">
            <LabelledCheckBox label="Fetch tags" inputRef={tagsRef} />
            <LabelledCheckBox
              label="Stash uncommitted changes temporarily"
              inputRef={autoStashRef}
            />
          </DialogSection>
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
