import { Backdrop, CircularProgress } from "@material-ui/core";
import classNames from "classnames";

const Loading: React.VFC<{ open: boolean }> = ({ open }) => (
  <div className={classNames("relative w-full h-full min-h-full min-y-full", !open && "hidden")}>
    <Backdrop className="z-9999 absolute" open={open}>
      <CircularProgress color="primary" size={64} />
    </Backdrop>
  </div>
);

export default Loading;
