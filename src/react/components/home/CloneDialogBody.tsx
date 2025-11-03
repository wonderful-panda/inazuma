import { IconButton, TextField } from "@mui/material";
import { DialogSection } from "../Dialog";
import { useCallback, useEffect, useRef } from "react";
import { Icon } from "../Icon";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAlert } from "@/context/AlertContext";
import type { PtyExitStatus } from "@/hooks/useXterm";
import { XtermDialogBody } from "../XtermDialogBody";

export const CloneDialogBody: React.FC<{
  openXterm: (el: HTMLDivElement, url: string, destinationFolder: string) => Promise<PtyExitStatus>;
  killPty: () => Promise<void>;
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

  const openXterm_ = useCallback(
    async (el: HTMLDivElement): Promise<PtyExitStatus> => {
      const url = urlRef.current?.value;
      const destinationFolder = destinationRef.current?.value;
      if (!url) {
        alert.showWarning("Url is not specified");
        urlRef.current?.focus();
        return "aborted";
      }
      if (!destinationFolder) {
        alert.showWarning("Destination folder is not specified");
        destinationRef.current?.focus();
        return "aborted";
      }
      return await openXterm(el, url, destinationFolder);
    },
    [openXterm, alert]
  );

  useEffect(() => {
    setTimeout(() => urlRef.current?.focus(), 0);
  }, []);

  return (
    <XtermDialogBody title="Clone repository" openXterm={openXterm_} killPty={killPty}>
      <DialogSection label="Repository URL">
        <div className="flex-row-nowrap">
          <Icon icon="mdi:web" className="mr-2 my-auto text-2xl" />
          <TextField inputRef={urlRef} className="flex-1 mr-10" variant="standard" />
        </div>
      </DialogSection>
      <DialogSection label="Destination folder">
        <div className="relative flex-row-nowrap">
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
      </DialogSection>
    </XtermDialogBody>
  );
};
