import { Backdrop, CircularProgress } from "@mui/material";
import classNames from "classnames";
import { forwardRef, useImperativeHandle, useRef } from "react";

export const Loading: React.FC<{ className?: string; open: boolean }> = ({ className, open }) => {
  return (
    <Backdrop className={classNames("z-9999 absolute bg-backdrop", className)} open={open}>
      <CircularProgress color="primary" size={64} />
    </Backdrop>
  );
};

export interface FullscreenLoadingMethods {
  show: () => void;
  hide: () => void;
}

const FullscreenLoading_: React.ForwardRefRenderFunction<FullscreenLoadingMethods> = (_, ref) => {
  const innerRef = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => ({
    show: () => {
      innerRef.current?.showModal();
    },
    hide: () => {
      innerRef.current?.close();
    }
  }));
  return (
    <dialog
      ref={innerRef}
      className="absolute bg-transparent backdrop:bg-backdrop w-screen h-screen m-0"
    >
      <div className="w-full h-full flex">
        <CircularProgress className="m-auto" color="primary" size={64} />
      </div>
    </dialog>
  );
};

export const FullscreenLoading = forwardRef(FullscreenLoading_);
