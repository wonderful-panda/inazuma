import { Backdrop, CircularProgress, withStyles } from "@material-ui/core";

const StyledBackdrop = withStyles({
  root: {
    zIndex: 9999
  }
})(Backdrop);

const Loading: React.VFC<{ open: boolean }> = ({ open }) => (
  <StyledBackdrop open={open}>
    <CircularProgress color="primary" size={64} />
  </StyledBackdrop>
);

export default Loading;
