import type { CustomCommand } from "@backend/CustomCommand";
import { Checkbox, FormControlLabel, IconButton, TextField, Tooltip } from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Icon } from "../Icon";

export interface CustomCommandFormProps {
  initialValue?: Partial<CustomCommand>;
  editMode: boolean;
  ref?: React.Ref<{ getValue: () => CustomCommand }>;
}

interface PlaceholderHelpProps {
  placeholders: Array<{ name: string; description: string }>;
  containerEl: HTMLElement | null;
}

const PlaceholderHelp: React.FC<PlaceholderHelpProps> = ({ placeholders, containerEl }) => {
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const title = (
    <div className="p-2 text-sm">
      <IconButton className="absolute top-1 right-1" onClick={handleClose} size="small">
        <Icon icon="mdi:close" />
      </IconButton>
      <div className="text-secondary font-semibold">Available placeholders</div>
      <div className="mx-2 grid grid-cols-[auto_1fr] gap-x-2 w-fit">
        {placeholders.map(({ name, description }) => (
          <>
            <span key={"name_" + name} className="font-mono font-bold">
              {"${" + name + "}"}
            </span>
            <span key={"desc_" + name}>{description}</span>
          </>
        ))}
      </div>
    </div>
  );

  return (
    <Tooltip
      open={open}
      disableFocusListener
      disableHoverListener
      classes={{ tooltip: "relative bg-tooltip border border-background drop-shadow max-w-96" }}
      title={title}
      slotProps={{ popper: { disablePortal: true, container: containerEl } }}
    >
      <IconButton size="small" className="my-auto" onClick={handleOpen}>
        <Icon icon="mdi:question-mark" />
      </IconButton>
    </Tooltip>
  );
};

export const CustomCommandForm: React.FC<CustomCommandFormProps> = (props) => {
  const { initialValue, editMode } = props;
  const [name, setName] = useState(initialValue?.name ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [commandLine, setCommandLine] = useState(initialValue?.commandLine ?? "");
  const [confirmBeforeExecute, setConfirmBeforeExecute] = useState(
    initialValue?.confirmBeforeExecute ?? false
  );
  const [useBuiltinTerminal, setUseBuiltinTerminal] = useState(
    initialValue?.useBuiltinTerminal ?? true
  );

  // Update form when initialValue changes
  useEffect(() => {
    setName(initialValue?.name ?? "");
    setDescription(initialValue?.description ?? "");
    setCommandLine(initialValue?.commandLine ?? "");
    setConfirmBeforeExecute(initialValue?.confirmBeforeExecute ?? false);
    setUseBuiltinTerminal(initialValue?.useBuiltinTerminal ?? true);
  }, [initialValue]);

  // Expose getValue method via ref
  useImperativeHandle(props.ref, () => ({
    getValue: () => ({
      name,
      description,
      commandLine,
      confirmBeforeExecute,
      useBuiltinTerminal
    })
  }));

  const el = useRef<HTMLDivElement>(null);
  return (
    <div className="relative flex-col-wrap p-4" ref={el}>
      <TextField
        label="Name"
        margin="dense"
        variant="standard"
        fullWidth
        required
        disabled={editMode}
        value={name}
        onChange={(e) => setName(e.target.value)}
        helperText={editMode ? "Name cannot be changed in edit mode" : ""}
      />
      <TextField
        label="Description"
        margin="dense"
        variant="standard"
        fullWidth
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex-row-nowrap">
        <TextField
          label="Command Line"
          margin="dense"
          variant="standard"
          fullWidth
          required
          multiline
          rows={3}
          value={commandLine}
          onChange={(e) => setCommandLine(e.target.value)}
        />
        <PlaceholderHelp
          containerEl={el.current}
          placeholders={[
            { name: "repo", description: "Repository path" },
            { name: "commit", description: "Commit id (full long hash)" }
          ]}
        />
      </div>
      <FormControlLabel
        control={
          <Checkbox
            checked={confirmBeforeExecute}
            onChange={(e) => setConfirmBeforeExecute(e.target.checked)}
          />
        }
        label="Show confirmation dialog before execution"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={useBuiltinTerminal}
            onChange={(e) => setUseBuiltinTerminal(e.target.checked)}
          />
        }
        label="Use built-in terminal"
      />
    </div>
  );
};
