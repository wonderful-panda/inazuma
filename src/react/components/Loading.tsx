import { Backdrop, CircularProgress } from "@material-ui/core";

const Loading: React.VFC<{ open: boolean }> = ({ open }) => (
  <Backdrop className="z-9999" open={open}>
    <CircularProgress color="primary" size={64} />
  </Backdrop>
);

export default Loading;
