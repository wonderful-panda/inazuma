import { invokeTauriCommand } from "@/invokeTauriCommand";
import { assertNever } from "@/util";
import {
  Autocomplete,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from "@mui/material";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState
} from "react";
import { DialogMethods } from "./Dialog";
import { FullscreenDialog } from "./FullscreenDialog";
import { REPORT_ERROR } from "@/store/misc";
import { useDispatch } from "@/store";
import classNames from "classnames";

const SectionContent: React.FC<ChildrenProp> = ({ children }) => (
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
        | "recentListCount";
      payload: string | null | undefined;
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
    const value = action.payload || undefined;
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
          const intValue = parseInt(value || "0");
          if (!isNaN(intValue) && intValue > 0) {
            newState.recentListCount = intValue;
          }
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
      renderInput={(params) => (
        <TextField
          {...params}
          className="w-[32rem]"
          label={label}
          margin="dense"
          variant="standard"
          onChange={({ target }) => onChange(target.value)}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} className={classNames("flex-row-nowrap pr-4", props.className)}>
          <span className="flex-1">{option}</span>
          <span style={{ fontFamily: option, color: "gray" }}>ABC</span>
        </li>
      )}
    />
  );
};

const PreferenceDialogContent = forwardRef<{ save: () => void }, PreferenceDialogProps>(
  function PreferenceDialogContent(props, ref) {
    const dispatchStore = useDispatch();
    const [state, dispatch] = useReducer(reducer, props.config);
    useImperativeHandle(ref, () => ({
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
          dispatchStore(REPORT_ERROR({ error }));
        });
    }, [dispatchStore]);
    return (
      <div className="p-2">
        <Typography variant="h6" component="div" color="primary">
          Font
        </Typography>
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
        <Typography variant="h6" component="div" color="primary">
          External tools
        </Typography>
        <SectionContent>
          <TextField
            label="External diff tool"
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
        <Typography variant="h6" component="div" color="primary">
          Miscellaneous
        </Typography>
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
        </SectionContent>
      </div>
    );
  }
);

const PreferenceDialogInner: React.ForwardRefRenderFunction<
  DialogMethods,
  PreferenceDialogProps
> = (props, ref) => {
  const [opened, setOpened] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => setOpened(true),
    close: () => setOpened(false)
  }));
  const contentRef = useRef({} as ComponentRef<typeof PreferenceDialogContent>);
  const close = useCallback(() => setOpened(false), []);
  const handleSave = useCallback(() => {
    contentRef.current.save();
    setOpened(false);
  }, []);
  return (
    <FullscreenDialog
      title="PREFERENCE"
      opened={opened}
      close={close}
      actions={[
        {
          text: "Save",
          color: "primary",
          default: true,
          onClick: handleSave
        }
      ]}
    >
      {opened && <PreferenceDialogContent ref={contentRef} {...props} />}
    </FullscreenDialog>
  );
};

export const PreferenceDialog = forwardRef(PreferenceDialogInner);
