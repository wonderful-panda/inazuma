import { forwardRef, useImperativeHandle, useState } from "react";
import { DialogHandler, FullscreenDialog } from "./FullscreenDialog";
import { version } from "../../../package.json";

export const AboutDialog = forwardRef<DialogHandler>((_, ref) => {
  const [isOpened, setOpened] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => setOpened(true),
    close: () => setOpened(false)
  }));
  return (
    <FullscreenDialog title="ABOUT" isOpened={isOpened} setOpened={setOpened}>
      <div>Inazuma {version}</div>
    </FullscreenDialog>
  );
});
