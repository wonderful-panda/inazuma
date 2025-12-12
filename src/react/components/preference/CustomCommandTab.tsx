import type { CustomCommand } from "@backend/CustomCommand";
import { Button, IconButton, List, ListItem, Typography } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import {
  AcceptButton,
  CancelButton,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@/components/Dialog";
import { Icon } from "@/components/Icon";
import { useDialog } from "@/context/DialogContext";
import { CustomCommandForm } from "./CustomCommandForm";
import { SectionContent, SectionHeader } from "./PreferenceSection";

export interface CustomCommandTabProps {
  customCommands: CustomCommand[];
  onChange: (commands: CustomCommand[]) => void;
}

const CustomCommandFormDialog: React.FC<{
  initialValue?: Partial<CustomCommand>;
  editMode: boolean;
  existingNames: string[];
  onSave: (command: CustomCommand) => void;
}> = ({ initialValue, editMode, existingNames, onSave }) => {
  const formRef = useRef({} as React.ComponentRef<typeof CustomCommandForm>);
  const [error, setError] = useState<string | null>(null);

  const handleSave = useCallback(() => {
    const command = formRef.current.getValue();

    // Validate required fields
    if (!command.name.trim()) {
      setError("Name is required");
      return Promise.resolve(false);
    }
    if (!command.commandLine.trim()) {
      setError("Command line is required");
      return Promise.resolve(false);
    }

    // Check for duplicate name (only when adding new command)
    if (!editMode) {
      const duplicate = existingNames.includes(command.name);
      if (duplicate) {
        setError("Command name already exists. Please use a different name.");
        return Promise.resolve(false);
      }
    }

    onSave(command);
    return Promise.resolve(true);
  }, [editMode, existingNames, onSave]);

  return (
    <>
      <DialogTitle>{editMode ? "Edit Custom Command" : "Add Custom Command"}</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" className="mb-2">
            {error}
          </Typography>
        )}
        <CustomCommandForm ref={formRef} initialValue={initialValue} editMode={editMode} />
      </DialogContent>
      <DialogActions>
        <AcceptButton text="Save" onClick={handleSave} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};

export const CustomCommandTab: React.FC<CustomCommandTabProps> = ({ customCommands, onChange }) => {
  const dialog = useDialog();

  const handleAdd = useCallback(() => {
    dialog.showModal({
      content: (
        <CustomCommandFormDialog
          editMode={false}
          existingNames={customCommands.map((cmd) => cmd.name)}
          onSave={(command) => {
            onChange([...customCommands, command]);
          }}
        />
      )
    });
  }, [dialog, customCommands, onChange]);

  const handleEdit = useCallback(
    (index: number, command: CustomCommand) => {
      dialog.showModal({
        content: (
          <CustomCommandFormDialog
            initialValue={command}
            editMode={true}
            existingNames={customCommands.map((cmd) => cmd.name)}
            onSave={(updatedCommand) => {
              const newCommands = [...customCommands];
              newCommands[index] = updatedCommand;
              onChange(newCommands);
            }}
          />
        )
      });
    },
    [dialog, customCommands, onChange]
  );

  const handleDelete = useCallback(
    (index: number) => {
      const newCommands = [...customCommands];
      newCommands.splice(index, 1);
      onChange(newCommands);
    },
    [customCommands, onChange]
  );

  return (
    <div className="p-2">
      <div className="flex-row-nowrap justify-between items-center">
        <SectionHeader text="Custom Commands" />
        <Button variant="contained" startIcon={<Icon icon="mdi:plus" />} onClick={handleAdd}>
          Add
        </Button>
      </div>
      <SectionContent>
        <List>
          {customCommands.length === 0 && (
            <Typography variant="body2" color="textSecondary" className="p-4">
              No custom commands defined. Click "Add" to create one.
            </Typography>
          )}
          {customCommands.map((cmd, index) => (
            <div key={cmd.name} className="group">
              <ListItem dense disablePadding className="hover:bg-hover-highlight">
                <div className="flex flex-1 flex-col px-4 py-2">
                  <Typography variant="subtitle1" className="font-bold">
                    {cmd.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {cmd.description}
                  </Typography>
                </div>
                <div className="mr-4 flex-row-nowrap gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 duration-75">
                  <IconButton
                    edge="end"
                    onClick={() => handleEdit(index, cmd)}
                    className="hover:bg-highlight text-2xl"
                    size="large"
                    title="Edit"
                  >
                    <Icon icon="mdi:pencil" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(index)}
                    className="hover:bg-highlight text-2xl"
                    size="large"
                    title="Delete"
                  >
                    <Icon icon="mdi:close" />
                  </IconButton>
                </div>
              </ListItem>
            </div>
          ))}
        </List>
      </SectionContent>
    </div>
  );
};
