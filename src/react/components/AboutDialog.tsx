import {
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
  useImperativeHandle,
  useState
} from "react";
import { DialogMethods } from "./Dialog";
import { FullscreenDialog } from "./FullscreenDialog";
import { version } from "../../../package.json";

const AboutDialogInner: ForwardRefRenderFunction<DialogMethods> = (_, ref) => {
  const [opened, setOpened] = useState(false);
  const close = useCallback(() => setOpened(false), []);
  useImperativeHandle(ref, () => ({
    open: () => setOpened(true),
    close: () => setOpened(false)
  }));
  return (
    <FullscreenDialog title="ABOUT" opened={opened} close={close}>
      <div>Inazuma {version}</div>
    </FullscreenDialog>
  );
};
export const AboutDialog = forwardRef(AboutDialogInner);
