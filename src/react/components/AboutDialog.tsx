import { useCallback } from "react";
import { version } from "../../../package.json";
import {
  CancelButton,
  DialogActions,
  DialogContent,
  DialogTitle,
  useDialog
} from "@/context/DialogContext";

export const useAboutDialog = () => {
  const dialog = useDialog();
  return useCallback(async () => {
    return dialog.showModal({
      content: <AboutDialogBody />,
      defaultActionKey: "Enter",
      fullscreen: true
    });
  }, [dialog]);
};

export const AboutDialogBody: React.FC = () => {
  return (
    <>
      <DialogTitle>ABOUT</DialogTitle>
      <DialogContent>
        <div>Inazuma {version}</div>
      </DialogContent>
      <DialogActions>
        <CancelButton />
      </DialogActions>
    </>
  );
};
