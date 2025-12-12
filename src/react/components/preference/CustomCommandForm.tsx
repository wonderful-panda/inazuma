import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { useEffect, useImperativeHandle, useState } from "react";
import type { CustomCommand } from "@backend/CustomCommand";

export interface CustomCommandFormProps {
  initialValue?: Partial<CustomCommand>;
  editMode: boolean;
  ref?: React.Ref<{ getValue: () => CustomCommand }>;
}

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

  return (
    <div className="flex-col-wrap p-4">
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
        helperText="Use ${repo}, ${branch}, ${commit} for placeholders"
      />
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
