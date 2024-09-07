import { IconButton, TextField } from "@mui/material";
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
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAlert } from "@/context/AlertContext";

export const CloneDialogBody: React.FC<{
  openXterm: (
    el: HTMLDivElement,
    url: string,
    destinationFolder: string
  ) => Promise<boolean | "failed">;
  killPty: () => void;
}> = ({ openXterm, killPty }) => {
  const openFolderSelector = useCallback(async () => {
    const ret = await invokeTauriCommand("show_folder_selector");
    if (ret && destinationRef.current) {
      destinationRef.current.value = ret;
    }
  }, []);

  const alert = useAlert();
  const urlRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const xtermRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);

  const handleOk = useCallback(async () => {
    if (!xtermRef.current) {
      return false;
    }
    const url = urlRef.current?.value;
    const destinationFolder = destinationRef.current?.value;
    if (!url) {
      alert.showWarning("Url is not specified");
      urlRef.current?.focus();
      return false;
    }
    if (!destinationFolder) {
      alert.showWarning("Destination folder is not specified");
      destinationRef.current?.focus();
      return false;
    }
    setRunning(true);
    try {
      return await openXterm(xtermRef.current, url, destinationFolder);
    } finally {
      setRunning(false);
    }
  }, [openXterm, alert]);
  useEffect(() => {
    setTimeout(() => urlRef.current?.focus(), 0);
  }, []);
  return (
    <>
      <DialogTitle>Clone repository</DialogTitle>
      <DialogContent>
        <div className="m-0 flex flex-col-nowrap w-[64rem]">
          <div className="text-primary">Repository URL</div>
          <div className="ml-6 mb-3 px-2 flex-row-nowrap">
            <Icon icon="mdi:web" className="mr-2 my-auto text-2xl" />
            <TextField inputRef={urlRef} className="flex-1 mr-10" variant="standard" />
          </div>

          <div className="text-primary">Destination folder</div>
          <div className="relative ml-6 mb-3 px-2 flex-row-nowrap">
            <Icon icon="mdi:folder" className="mr-2 my-auto text-2xl" />
            <TextField inputRef={destinationRef} className="flex-1 mr-10" variant="standard" />
            <IconButton
              title="Open folder selector"
              className="absolute right-0 p-0 my-auto h-10 w-10"
              onClick={openFolderSelector as VoidReturn<typeof openFolderSelector>}
              size="large"
            >
              <Icon className="text-2xl text-inherit" icon="mdi:folder-search-outline" />
            </IconButton>
          </div>
          <div
            ref={xtermRef}
            className="border border-highlight bg-console px-2 py-1 m-0 h-[24rem]"
          ></div>
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
