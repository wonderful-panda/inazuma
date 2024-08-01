import { Tooltip } from "@mui/material";
import { ComponentProps, useCallback, useRef, useState } from "react";

export const LazyTooltip: React.FC<{
  className: string;
  renderTooltip: () => React.ReactNode;
  children: ComponentProps<typeof Tooltip>["children"];
}> = ({ children, renderTooltip, className }) => {
  const [open, setOpen] = useState(false);
  const title = useRef<React.ReactNode | null>(null);
  const handleOpen = useCallback(() => {
    title.current = renderTooltip();
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    title.current = null;
    setOpen(false);
  }, []);

  return (
    <Tooltip
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      title={title.current}
      classes={{
        tooltip: className
      }}
    >
      {children}
    </Tooltip>
  );
};
