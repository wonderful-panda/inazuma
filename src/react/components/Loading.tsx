import { Backdrop, CircularProgress } from "@mui/material";

export const Loading: React.FC<{ open: boolean }> = ({ open }) => (
  <Backdrop className="z-9999 absolute bg-[#00000060]" open={open}>
    <CircularProgress color="primary" size={64} />
  </Backdrop>
);
