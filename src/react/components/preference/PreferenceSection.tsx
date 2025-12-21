import { Typography } from "@mui/material";

export const SectionHeader: React.FC<{ text: string }> = ({ text }) => (
  <Typography variant="h6" component="div" color="primary">
    {text}
  </Typography>
);

export const SectionContent: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex-col-wrap px-4 pt-0 pb-8">{children}</div>
);
