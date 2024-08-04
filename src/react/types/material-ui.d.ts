// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Theme, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles/createTheme" {
  export interface Theme {
    custom: {
      baseFontSize: number;
    };
  }

  export interface ThemeOptions {
    custom: {
      baseFontSize: number;
    };
  }
}
