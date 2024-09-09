import {
  DialogContent,
  DialogTitle,
  DialogActions,
  AcceptButton,
  CancelButton,
  DialogButton
} from "../Dialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";
import { useAlert } from "@/context/AlertContext";
import { NativeSelect } from "@mui/material";

export const PushDialogBody: React.FC<{
  remotes: readonly string[];
  branchName: string;
  openXterm: (
    el: HTMLDivElement,
    remote: string,
    branchName: string
  ) => Promise<boolean | "failed">;
  killPty: () => Promise<void>;
}> = ({ remotes, branchName, openXterm, killPty }) => {
  const alert = useAlert();
  const remoteRef = useRef<HTMLInputElement>(null);
  const xtermRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setTimeout(() => remoteRef.current?.focus(), 0);
  }, []);

  const handleOk = useCallback(async () => {
    if (!remoteRef.current || !xtermRef.current) {
      return false;
    }
    const remote = remoteRef.current.value;
    if (!remote) {
      alert.showWarning("Remote is not specified");
      remoteRef.current.focus();
      return false;
    }
    setRunning(true);
    try {
      return await openXterm(xtermRef.current, remote, branchName);
    } finally {
      setRunning(false);
    }
  }, [openXterm, alert, branchName]);
  return (
    <>
      <DialogTitle>Push changes</DialogTitle>
      <DialogContent>
        <div className="m-0 flex flex-col-nowrap w-[64rem]">
          <div className="text-primary">Remote repository</div>
          <div className="ml-6 mb-3 px-2 flex-row-nowrap">
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
          <div className="text-primary">Branch name to push</div>
          <div className="ml-6 mb-2 px-2 flex-row-nowrap">
            <Icon icon="mdi:source-branch" className="mr-2 my-auto text-2xl" />
            {branchName}
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