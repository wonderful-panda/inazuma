import type { CommitCustomCommand } from "@backend/CommitCustomCommand";
import type { FileCustomCommand } from "@backend/FileCustomCommand";
import type { RepositoryConfig } from "@backend/RepositoryConfig";

export interface PreferenceState {
  config: Config;
  repoConfig: RepositoryConfig | null;
}

export type PreferenceAction =
  | {
      type:
        | "fontFamilyStandard"
        | "fontFamilyMonospace"
        | "fontSize"
        | "externalDiff"
        | "interactiveShell"
        | "recentListCount"
        | "avatarShape"
        | "logLevel";
      payload: string | null | undefined;
    }
  | {
      type: "useGravatar";
      payload: boolean;
    }
  | {
      type: "customCommands";
      payload: CommitCustomCommand[];
    }
  | {
      type: "customFileCommands";
      payload: FileCustomCommand[];
    }
  | {
      type: "repoCustomCommands";
      payload: CommitCustomCommand[];
    }
  | {
      type: "repoCustomFileCommands";
      payload: FileCustomCommand[];
    }
  | {
      type: "reset";
      payload: PreferenceState;
    };

export type PreferenceDispatch = React.Dispatch<PreferenceAction>;

export interface TabContentProps {
  config: Config;
  repoConfig: RepositoryConfig | null;
  dispatch: PreferenceDispatch;
}
