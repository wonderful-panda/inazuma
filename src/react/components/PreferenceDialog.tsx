import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from "@mui/material";
import classNames from "classnames";
import { useCallback, useEffect, useImperativeHandle, useReducer, useRef, useState } from "react";
import {
  AcceptButton,
  CancelButton,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@/components/Dialog";
import { useAlert } from "@/context/AlertContext";
import { useDialog } from "@/context/DialogContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { assertNever } from "@/util";

const SectionHeader: React.FC<{ text: string }> = ({ text }) => (
  <Typography variant="h6" component="div" color="primary">
    {text}
  </Typography>
);

const SectionContent: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="flex-col-wrap px-4 pt-0 pb-8">{children}</div>
);

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
      type: "reset";
      payload: Config;
    };

const reducer = (state: Config, action: Action) => {
  if (action.type === "reset") {
    return action.payload;
  } else if (action.type === "useGravatar") {
    return { ...state, useGravatar: action.payload };
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

const FontSelector: React.FC<{
  label: string;
  fontFamilies: string[] | "loading";
  value: string | null | undefined;
  onChange: (value: string | null | undefined) => void;
}> = ({ label, value, fontFamilies, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      loading={fontFamilies === "loading"}
      options={fontFamilies === "loading" ? [] : fontFamilies}
      value={value}
      autoHighlight
      onChange={(_e, value) => onChange(value)}
      freeSolo
      disablePortal
      renderInput={(params) => (
        <TextField
          {...params}
          className="w-lg"
          label={label}
          margin="dense"
          variant="standard"
          onChange={({ target }) => onChange(target.value)}
        />
      )}
      renderOption={({ key, className, ...rest }, option) => (
        <li {...rest} key={key as string} className={classNames("flex-row-nowrap pr-4", className)}>
          <span className="flex-1">{option}</span>
          <span style={{ fontFamily: option, color: "gray" }}>ABC</span>
        </li>
      )}
    />
  );
};

const PreferenceDialogContent: React.FC<
  PreferenceDialogProps & { ref?: React.Ref<{ save: () => void }> }
> = (props) => {
  const { reportError } = useAlert();
  const [state, dispatch] = useReducer(reducer, props.config);
  useImperativeHandle(props.ref, () => ({
    save: () => props.onConfigChange(state)
  }));
  const [standardFonts, setStandardFonts] = useState<string[] | "loading">("loading");
  const [monospaceFonts, setMonospaceFonts] = useState<string[] | "loading">("loading");
  useEffect(() => {
    invokeTauriCommand("get_system_fonts")
      .then((fonts) => {
        const standard = [...new Set(fonts.map((f) => f.familyName))].sort();
        const monospace = [
          ...new Set(fonts.filter((f) => f.monospace).map((f) => f.familyName))
        ].sort();
        setStandardFonts(standard);
        setMonospaceFonts(monospace);
      })
      .catch((error) => {
        reportError({ error });
      });
  }, [reportError]);
  return (
    <div className="p-2">
      <SectionHeader text="Font" />
      <SectionContent>
        <FontSelector
          label="Default font"
          fontFamilies={standardFonts}
          value={state.fontFamily.standard}
          onChange={(payload) => dispatch({ type: "fontFamilyStandard", payload })}
        />
        <FontSelector
          label="Monospace font"
          fontFamilies={monospaceFonts}
          value={state.fontFamily.monospace}
          onChange={(payload) => dispatch({ type: "fontFamilyMonospace", payload })}
        />
        <div className="flex-col-nowrap mt-4">
          <FormLabel>Font size</FormLabel>
          <RadioGroup
            row
            value={state.fontSize}
            onChange={({ target }) => dispatch({ type: "fontSize", payload: target.value })}
          >
            <FormControlLabel value="x-small" control={<Radio />} label="x-small" />
            <FormControlLabel value="small" control={<Radio />} label="small" />
            <FormControlLabel value="medium" control={<Radio />} label="medium" />
          </RadioGroup>
        </div>
      </SectionContent>
      <SectionHeader text="External tools" />
      <SectionContent>
        <TextField
          /* eslint-disable-next-line no-template-curly-in-string */
          label="External diff tool (${left} and ${right} will be replaced with file path)"
          margin="dense"
          variant="standard"
          value={state.externalDiffTool}
          onChange={({ target }) => dispatch({ type: "externalDiff", payload: target.value })}
        />
        <TextField
          label="Interactive shell"
          margin="dense"
          variant="standard"
          value={state.interactiveShell}
          onChange={({ target }) => dispatch({ type: "interactiveShell", payload: target.value })}
        />
      </SectionContent>
      <SectionHeader text="Avatar" />
      <SectionContent>
        <div className="flex-col-nowrap mt-4">
          <FormLabel>Shape</FormLabel>
          <RadioGroup
            row
            value={state.avatarShape}
            onChange={({ target }) => dispatch({ type: "avatarShape", payload: target.value })}
          >
            <FormControlLabel value="square" control={<Radio />} label="square" />
            <FormControlLabel value="circle" control={<Radio />} label="circle" />
          </RadioGroup>
        </div>
        <FormControlLabel
          label="Fetch avatars from Gravatar.com"
          control={
            <Checkbox
              checked={state.useGravatar}
              onChange={({ target }) => dispatch({ type: "useGravatar", payload: target.checked })}
            />
          }
        />
      </SectionContent>

      <SectionHeader text="Miscellaneus" />
      <SectionContent>
        <TextField
          label="Number of recent opened list"
          type="number"
          margin="dense"
          variant="standard"
          style={{ maxWidth: "240px" }}
          value={state.recentListCount}
          onChange={({ target }) => dispatch({ type: "recentListCount", payload: target.value })}
        />
        <div className="flex-col-nowrap mt-4">
          <FormLabel>Log level</FormLabel>
          <RadioGroup
            row
            value={state.logLevel}
            onChange={({ target }) => dispatch({ type: "logLevel", payload: target.value })}
          >
            <FormControlLabel value="off" control={<Radio />} label="off" />
            <FormControlLabel value="error" control={<Radio />} label="error" />
            <FormControlLabel value="warn" control={<Radio />} label="warn" />
            <FormControlLabel value="info" control={<Radio />} label="info" />
            <FormControlLabel value="debug" control={<Radio />} label="debug" />
            <FormControlLabel value="trace" control={<Radio />} label="trace" />
          </RadioGroup>
        </div>
      </SectionContent>
    </div>
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
