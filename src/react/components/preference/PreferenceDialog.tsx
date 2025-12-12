import type { CustomCommand } from "@backend/CustomCommand";
import { Box, Tab, Tabs } from "@mui/material";
import { useCallback, useImperativeHandle, useReducer, useRef, useState } from "react";
import {
  AcceptButton,
  CancelButton,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@/components/Dialog";
import { DialogProvider, useDialog } from "@/context/DialogContext";
import { assertNever } from "@/util";
import { CustomCommandTab } from "./CustomCommandTab";
import { GeneralTab } from "./GeneralTab";

type Action =
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
      payload: CustomCommand[];
    }
  | {
      type: "reset";
      payload: Config;
    };

const reducer = (state: Config, action: Action) => {
  if (action.type === "reset") {
    return action.payload;
  } else if (action.type === "useGravatar") {
    return { ...state, useGravatar: action.payload };
  } else if (action.type === "customCommands") {
    return { ...state, customCommands: action.payload };
  } else {
    const newState = { ...state };
    const value = action.payload ?? undefined;
    switch (action.type) {
      case "fontFamilyStandard":
        newState.fontFamily = { ...state.fontFamily, standard: value };
        break;
      case "fontFamilyMonospace":
        newState.fontFamily = { ...state.fontFamily, monospace: value };
        break;
      case "fontSize":
        if (value === "x-small" || value === "small") {
          newState.fontSize = value;
        } else {
          newState.fontSize = "medium";
        }
        break;
      case "externalDiff":
        newState.externalDiffTool = value;
        break;
      case "interactiveShell":
        newState.interactiveShell = value;
        break;
      case "recentListCount":
        {
          const intValue = Number.parseInt(value ?? "0", 10);
          if (!Number.isNaN(intValue) && intValue > 0) {
            newState.recentListCount = intValue;
          }
        }
        break;
      case "avatarShape":
        newState.avatarShape = value === "circle" ? "circle" : "square";
        break;
      case "logLevel":
        if (
          value === "off" ||
          value === "error" ||
          value === "warn" ||
          value === "info" ||
          value === "debug" ||
          value === "trace"
        ) {
          newState.logLevel = value;
        }
        break;
      default:
        assertNever(action);
    }
    return newState;
  }
};

export interface PreferenceDialogProps {
  config: Config;
  onConfigChange: (config: Config) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index} className="flex-1 overflow-auto">
      {value === index && <div>{children}</div>}
    </div>
  );
};

const PreferenceDialogContent: React.FC<
  PreferenceDialogProps & { ref?: React.Ref<{ save: () => void }> }
> = (props) => {
  const [state, dispatch] = useReducer(reducer, props.config);
  const [currentTab, setCurrentTab] = useState(0);

  useImperativeHandle(props.ref, () => ({
    save: () => props.onConfigChange(state)
  }));

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      <DialogProvider>
        <Tabs
          orientation="vertical"
          value={currentTab}
          onChange={handleTabChange}
          sx={{ borderRight: 1, borderColor: "divider", minWidth: 150 }}
        >
          <Tab label="General" />
          <Tab label="Custom Commands" />
        </Tabs>
        <TabPanel value={currentTab} index={0}>
          <GeneralTab state={state} dispatch={dispatch} />
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <CustomCommandTab
            customCommands={state.customCommands}
            onChange={(commands) => dispatch({ type: "customCommands", payload: commands })}
          />
        </TabPanel>
      </DialogProvider>
    </Box>
  );
};

export const PreferenceDialogBody: React.FC<PreferenceDialogProps> = (props) => {
  const contentRef = useRef({} as React.ComponentRef<typeof PreferenceDialogContent>);
  const handleSave = useCallback(() => {
    contentRef.current.save();
    return Promise.resolve(true);
  }, []);
  return (
    <>
      <DialogTitle>PREFERENCE</DialogTitle>
      <DialogContent>
        <PreferenceDialogContent ref={contentRef} {...props} />
      </DialogContent>
      <DialogActions>
        <AcceptButton text="Save" onClick={handleSave} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};

export const usePreferenceDialog = () => {
  const dialog = useDialog();
  return useCallback(
    async (props: PreferenceDialogProps) => {
      return await dialog.showModal({
        content: <PreferenceDialogBody {...props} />,
        defaultActionKey: "Ctrl+Enter",
        fullscreen: true
      });
    },
    [dialog]
  );
};
