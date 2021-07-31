import { assertNever } from "@/util";
import { TextField, Typography } from "@material-ui/core";
import { forwardRef, useCallback, useImperativeHandle, useReducer, useRef, useState } from "react";
import styled from "styled-components";
import { DialogHandler, FullscreenDialog } from "./FullscreenDialog";

const Content = styled.div`
  padding: 0.5rem;
`;

const SectionContent = styled.div`
  padding: 0 1rem 2rem 1rem;
  display: flex;
  flex-direction: column;
`;

type Action =
  | {
      type:
        | "fontFamilyStandard"
        | "fontFamilyMonospace"
        | "externalDiff"
        | "interactiveShell"
        | "recentListCount";
      payload: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
    }
  | {
      type: "reset";
      payload: Config;
    };

const reducer = (state: Config, action: Action) => {
  if (action.type === "reset") {
    return action.payload;
  } else {
    const newState = { ...state };
    const value = action.payload.target.value;
    switch (action.type) {
      case "fontFamilyStandard":
        newState.fontFamily = { ...state.fontFamily, standard: value };
        break;
      case "fontFamilyMonospace":
        newState.fontFamily = { ...state.fontFamily, monospace: value };
        break;
      case "externalDiff":
        newState.externalDiffTool = value;
        break;
      case "interactiveShell":
        newState.interactiveShell = value;
        break;
      case "recentListCount":
        let intValue = parseInt(value);
        if (!isNaN(intValue) && intValue > 0) {
          newState.recentListCount = intValue;
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

const PreferenceDialogContent = forwardRef<{ save: () => void }, PreferenceDialogProps>(
  (props, ref) => {
    const [state, dispatch] = useReducer(reducer, props.config);
    useImperativeHandle(ref, () => ({
      save: () => props.onConfigChange(state)
    }));
    return (
      <Content>
        <Typography variant="h6" component="div" color="primary">
          Font
        </Typography>
        <SectionContent>
          <TextField
            label="Default font"
            margin="dense"
            value={state.fontFamily.standard}
            onChange={(payload) => dispatch({ type: "fontFamilyStandard", payload })}
          />
          <TextField
            label="Monospace font"
            margin="dense"
            value={state.fontFamily.monospace}
            onChange={(payload) => dispatch({ type: "fontFamilyMonospace", payload })}
          />
        </SectionContent>
        <Typography variant="h6" component="div" color="primary">
          External tools
        </Typography>
        <SectionContent>
          <TextField
            label="External diff tool"
            margin="dense"
            value={state.externalDiffTool}
            onChange={(payload) => dispatch({ type: "externalDiff", payload })}
          />
          <TextField
            label="Interactive shell"
            margin="dense"
            value={state.interactiveShell}
            onChange={(payload) => dispatch({ type: "interactiveShell", payload })}
          />
        </SectionContent>
        <Typography variant="h6" component="div" color="primary">
          Miscellaneous
        </Typography>
        <SectionContent>
          <TextField
            label="Number of recent opened list"
            type="number"
            margin="dense"
            style={{ maxWidth: "240px" }}
            value={state.recentListCount}
            onChange={(payload) => dispatch({ type: "recentListCount", payload })}
          />
        </SectionContent>
      </Content>
    );
  }
);

export const PreferenceDialog = forwardRef<DialogHandler, PreferenceDialogProps>((props, ref) => {
  const [isOpened, setOpened] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => setOpened(true),
    close: () => setOpened(false)
  }));
  const contentRef = useRef({} as ComponentRef<typeof PreferenceDialogContent>);
  const handleSave = useCallback(() => {
    contentRef.current.save();
    setOpened(false);
  }, []);
  return (
    <FullscreenDialog
      title="PREFERENCE"
      isOpened={isOpened}
      setOpened={setOpened}
      actions={[
        {
          text: "Save",
          color: "primary",
          onClick: handleSave
        }
      ]}
    >
      {isOpened && <PreferenceDialogContent ref={contentRef} {...props} />}
    </FullscreenDialog>
  );
});
