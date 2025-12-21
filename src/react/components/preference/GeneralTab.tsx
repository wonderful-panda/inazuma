import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField
} from "@mui/material";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useAlert } from "@/context/AlertContext";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { SectionContent, SectionHeader } from "./PreferenceSection";
import type { TabContentProps } from "./types";

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

export const GeneralTab: React.FC<TabContentProps> = ({ config, dispatch }) => {
  const { reportError } = useAlert();
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
          value={config.fontFamily.standard}
          onChange={(payload) => dispatch({ type: "fontFamilyStandard", payload })}
        />
        <FontSelector
          label="Monospace font"
          fontFamilies={monospaceFonts}
          value={config.fontFamily.monospace}
          onChange={(payload) => dispatch({ type: "fontFamilyMonospace", payload })}
        />
        <div className="flex-col-nowrap mt-4">
          <FormLabel>Font size</FormLabel>
          <RadioGroup
            row
            value={config.fontSize}
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
          value={config.externalDiffTool}
          onChange={({ target }) => dispatch({ type: "externalDiff", payload: target.value })}
        />
        <TextField
          label="Interactive shell"
          margin="dense"
          variant="standard"
          value={config.interactiveShell}
          onChange={({ target }) => dispatch({ type: "interactiveShell", payload: target.value })}
        />
      </SectionContent>
      <SectionHeader text="Avatar" />
      <SectionContent>
        <div className="flex-col-nowrap mt-4">
          <FormLabel>Shape</FormLabel>
          <RadioGroup
            row
            value={config.avatarShape}
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
              checked={config.useGravatar}
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
          value={config.recentListCount}
          onChange={({ target }) => dispatch({ type: "recentListCount", payload: target.value })}
        />
        <div className="flex-col-nowrap mt-4">
          <FormLabel>Log level</FormLabel>
          <RadioGroup
            row
            value={config.logLevel}
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
