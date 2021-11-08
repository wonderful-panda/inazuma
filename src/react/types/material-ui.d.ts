import { Theme, ThemeOptions } from "@material-ui/core/styles/createTheme";

declare module "@material-ui/core/styles/createTheme" {
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
