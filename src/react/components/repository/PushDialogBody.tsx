import { DialogSection } from "../Dialog";
import { useCallback, useEffect, useRef } from "react";
import { Icon } from "../Icon";
import { useAlert } from "@/context/AlertContext";
import { NativeSelect } from "@mui/material";
import type { PtyExitStatus } from "@/hooks/useXterm";
import { XtermDialogBody } from "../XtermDialogBody";

export const PushDialogBody: React.FC<{
  remotes: readonly string[];
  branchName: string;
  openXterm: (el: HTMLDivElement, remote: string, branchName: string) => Promise<PtyExitStatus>;
  killPty: () => Promise<void>;
}> = ({ remotes, branchName, openXterm, killPty }) => {
  const alert = useAlert();
  const remoteRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTimeout(() => remoteRef.current?.focus(), 0);
  }, []);

  const openXterm_ = useCallback(
    async (el: HTMLDivElement): Promise<PtyExitStatus> => {
      if (!remoteRef.current) {
        return "aborted";
      }
      const remote = remoteRef.current.value;
      if (!remote) {
        alert.showWarning("Remote is not specified");
        remoteRef.current.focus();
        return "aborted";
      }
      return await openXterm(el, remote, branchName);
    },
    [openXterm, alert, branchName]
  );

  return (
    <XtermDialogBody title="Push changes" openXterm={openXterm_} killPty={killPty}>
      <DialogSection label="Remote repository">
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
      <DialogSection label="Branch name to push">
        <div className="flex-row-nowrap">
          <Icon icon="mdi:source-branch" className="mr-2 my-auto text-2xl" />
          {branchName}
        </div>
      </DialogSection>
    </XtermDialogBody>
  );
};
