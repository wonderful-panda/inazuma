export type FontSize = "x-small" | "small" | "medium";

export interface Config {
  fontFamily: {
    standard?: string;
    monospace?: string;
  };
  fontSize: FontSize;
  recentListCount: number;
  externalDiffTool?: string;
  interactiveShell?: string;
}

export interface Environment {
  windowSize?: {
    width: number;
    height: number;
    maximized: boolean;
  };
  recentOpened?: string[];
  state?: Record<string, string>;
}
