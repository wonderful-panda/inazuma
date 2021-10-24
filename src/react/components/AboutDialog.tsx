import { forwardRef, ForwardRefRenderFunction, useImperativeHandle, useState } from "react";
import { DialogMethods, FullscreenDialog } from "./FullscreenDialog";
import { version } from "../../../package.json";

const AboutDialogInner: ForwardRefRenderFunction<DialogMethods> = (_, ref) => {
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
};
export const AboutDialog = forwardRef(AboutDialogInner);
