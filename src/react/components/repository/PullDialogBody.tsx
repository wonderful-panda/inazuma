import { NativeSelect, RadioGroup } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import { useAlert } from "@/context/AlertContext";
import type { PtyExitStatus } from "@/hooks/useXterm";
import { DialogSection, LabelledCheckBox, LabelledRadio } from "../Dialog";
import { Icon } from "../Icon";
import { XtermDialogBody } from "../XtermDialogBody";

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
  openXterm: (el: HTMLDivElement, options: PullOptions) => Promise<PtyExitStatus>;
  killPty: () => Promise<void>;
}> = ({ remotes, openXterm, killPty }) => {
  const alert = useAlert();
  const modeRef = useRef<HTMLDivElement>(null);
  const remoteRef = useRef<HTMLInputElement | null>(null);
  const tagsRef = useRef<HTMLInputElement>(null);
  const autoStashRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<PullMode>("--ff");

  const handleChangeMode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMode(e.target.value as PullMode);
  }, []);

  const openXterm_ = useCallback(
    async (el: HTMLDivElement): Promise<PtyExitStatus> => {
      if (!remoteRef.current) {
        return "aborted";
      }
      const remote = remoteRef.current.value;
      const tags = tagsRef.current?.checked;
      const autoStash = autoStashRef.current?.checked;
      if (!remote) {
        alert.showWarning("Remote is not specified");
        return "aborted";
      }
      return await openXterm(el, { mode, remote, tags, autoStash });
    },
    [openXterm, alert, mode]
  );
  return (
    <XtermDialogBody
      title="Pull(fetch and merge) changes from remote repository"
      openXterm={openXterm_}
      killPty={killPty}
    >
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
        <LabelledCheckBox label="Stash uncommitted changes temporarily" inputRef={autoStashRef} />
      </DialogSection>
    </XtermDialogBody>
  );
};
