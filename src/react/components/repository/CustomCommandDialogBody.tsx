import { useCallback } from "react";
import type { PtyExitStatus } from "@/hooks/useXterm";
import { DialogSection } from "../Dialog";
import { XtermDialogBody } from "../XtermDialogBody";

export const CustomCommandDialogBody: React.FC<{
  name: string;
  description?: string;
  commandLine: string;
  openXterm: (el: HTMLDivElement, commandLine: string) => Promise<PtyExitStatus>;
  killPty: () => Promise<void>;
}> = ({ name, description, commandLine, openXterm, killPty }) => {
  const openXterm_ = useCallback(
    async (el: HTMLDivElement): Promise<PtyExitStatus> => {
      return await openXterm(el, commandLine);
    },
    [openXterm, commandLine]
  );

  return (
    <XtermDialogBody
      title="Custom Command Runner"
      openXterm={openXterm_}
      killPty={killPty}
      startImmediate
    >
      <DialogSection label={description || name} />
    </XtermDialogBody>
  );
};
