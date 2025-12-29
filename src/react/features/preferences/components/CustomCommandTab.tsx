import type { CommitCustomCommand } from "@backend/CommitCustomCommand";
import type { FileCustomCommand } from "@backend/FileCustomCommand";
import { IconButton, List, ListItem, Typography } from "@mui/material";
import { useCallback, useRef, useState } from "react";
import {
  AcceptButton,
  CancelButton,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@/shared/components/ui/Dialog";
import { Icon } from "@/shared/components/ui/Icon";
import { useDialog } from "@/core/context/DialogContext";
import { useDragAndDropReorder } from "@/shared/hooks/integration/useDragAndDropReorder";
import { type CommandType, CustomCommandForm } from "./CustomCommandForm";
import { SectionContent, SectionHeader } from "./PreferenceSection";
import type { TabContentProps } from "./types";

const CustomCommandFormDialog: React.FC<{
  commandType: CommandType;
  initialValue?: Partial<CommitCustomCommand> | Partial<FileCustomCommand>;
  editMode: boolean;
  existingNames: string[];
  onSave: (command: CommitCustomCommand | FileCustomCommand) => void;
}> = ({ commandType, initialValue, editMode, existingNames, onSave }) => {
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

  const titleText = `${editMode ? "Edit" : "Add"} ${commandType} Command`;
  return (
    <>
      <DialogTitle>{titleText}</DialogTitle>
      <DialogContent>
        {error && (
          <Typography color="error" className="mb-2">
            {error}
          </Typography>
        )}
        <CustomCommandForm
          ref={formRef}
          commandType={commandType}
          initialValue={initialValue}
          editMode={editMode}
        />
      </DialogContent>
      <DialogActions>
        <AcceptButton text="Save" onClick={handleSave} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};

interface CustomCommandListProps<T extends CommitCustomCommand | FileCustomCommand> {
  title: string;
  commandType: CommandType;
  customCommands: T[];
  onChange: (commands: T[]) => void;
  emptyMessage?: string;
}

function CustomCommandList<T extends CommitCustomCommand | FileCustomCommand>({
  title,
  commandType,
  customCommands,
  onChange,
  emptyMessage = 'No custom commands defined. Click "Add" to create one.'
}: CustomCommandListProps<T>) {
  const dialog = useDialog();
  const { draggedIndex, dragOverIndex, insertPosition, handlers } = useDragAndDropReorder(
    customCommands,
    onChange
  );

  const handleAdd = useCallback(() => {
    dialog.showModal({
      content: (
        <CustomCommandFormDialog
          commandType={commandType}
          editMode={false}
          existingNames={customCommands.map((cmd) => cmd.name)}
          onSave={(command) => {
            onChange([...customCommands, command as T]);
          }}
        />
      )
    });
  }, [dialog, commandType, customCommands, onChange]);

  const handleEdit = useCallback(
    (index: number, command: T) => {
      dialog.showModal({
        content: (
          <CustomCommandFormDialog
            commandType={commandType}
            initialValue={command}
            editMode={true}
            existingNames={customCommands.map((cmd) => cmd.name)}
            onSave={(updatedCommand) => {
              const newCommands = [...customCommands];
              newCommands[index] = updatedCommand as T;
              onChange(newCommands);
            }}
          />
        )
      });
    },
    [dialog, commandType, customCommands, onChange]
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
    <div className="flex flex-col h-full">
      <div className="flex-row-nowrap justify-between items-center">
        <SectionHeader text={title} />
        <IconButton onClick={handleAdd} title={`Add ${commandType} command`}>
          <Icon icon="mdi:add" />
        </IconButton>
      </div>
      <div className="flex-1 overflow-auto">
        <SectionContent>
          <List>
            {customCommands.length === 0 && (
              <Typography variant="body2" color="textSecondary" className="p-4">
                {emptyMessage}
              </Typography>
            )}
            {customCommands.map((cmd, index) => (
              <div
                key={cmd.name}
                draggable
                onDragStart={(e) => handlers.handleDragStart(e, index)}
                onDragOver={(e) => handlers.handleDragOver(e, index)}
                onDragLeave={handlers.handleDragLeave}
                onDrop={(e) => handlers.handleDrop(e, index)}
                onDragEnd={handlers.handleDragEnd}
                onKeyDown={(e) => handlers.handleKeyDown(e, index)}
                tabIndex={0}
                role="button"
                aria-label={`${cmd.name}. Press up or down arrow keys to reorder`}
                className={`
                  group
                  ${draggedIndex === index ? "opacity-50" : ""}
                  ${
                    dragOverIndex === index
                      ? insertPosition === "before"
                        ? "border-t-2 border-primary"
                        : "border-b-2 border-primary"
                      : ""
                  }
                `}
              >
                <ListItem dense disablePadding className="hover:bg-hover-highlight">
                  {/* Drag handle */}
                  <div
                    className="px-2 cursor-move hover:bg-gray-100 rounded"
                    title="Drag to reorder"
                  >
                    <Icon icon="mdi:drag-vertical" className="text-gray-400 hover:text-gray-600" />
                  </div>

                  <div className="grid px-4 py-2 w-full">
                    <Typography variant="subtitle1" className="font-bold">
                      {cmd.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      className="text-greytext overflow-hidden whitespace-nowrap ellipsis"
                    >
                      {cmd.description || "No description"}
                    </Typography>
                  </div>
                  <div className="mr-4 flex-row-nowrap gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 duration-75">
                    <IconButton
                      edge="end"
                      onClick={() => handleEdit(index, cmd)}
                      className="hover:bg-highlight text-xl"
                      size="medium"
                      title="Edit"
                    >
                      <Icon icon="mdi:pencil" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(index)}
                      className="hover:bg-highlight text-xl"
                      size="medium"
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
    </div>
  );
}

export const CustomCommandTab: React.FC<TabContentProps> = ({ config, repoConfig, dispatch }) => {
  const handleGlobalCommitCommandsChange = useCallback(
    (commands: CommitCustomCommand[]) => {
      dispatch({ type: "customCommands", payload: commands });
    },
    [dispatch]
  );

  const handleGlobalFileCommandsChange = useCallback(
    (commands: FileCustomCommand[]) => {
      dispatch({ type: "customFileCommands", payload: commands });
    },
    [dispatch]
  );

  const handleRepositoryCommitCommandsChange = useCallback(
    (commands: CommitCustomCommand[]) => {
      dispatch({ type: "repoCustomCommands", payload: commands });
    },
    [dispatch]
  );

  const handleRepositoryFileCommandsChange = useCallback(
    (commands: FileCustomCommand[]) => {
      dispatch({ type: "repoCustomFileCommands", payload: commands });
    },
    [dispatch]
  );

  return (
    <div className="p-2 h-full flex gap-4">
      {/* Left column: Commit Commands */}
      <div className="px-4 flex-1 flex flex-col">
        {/* Global commit commands */}
        <div className="flex-1 overflow-hidden mb-4">
          <CustomCommandList
            title="Commit commands"
            commandType="commit"
            customCommands={config.customCommands}
            onChange={handleGlobalCommitCommandsChange}
          />
        </div>

        {/* Repository-specific commit commands */}
        {repoConfig && (
          <div className="flex-1 overflow-hidden pt-4">
            <CustomCommandList
              title="Commit commands (Repository-specific)"
              commandType="commit"
              customCommands={repoConfig.customCommands}
              onChange={handleRepositoryCommitCommandsChange}
              emptyMessage="No repository-specific commands. These commands will only be available in this repository."
            />
          </div>
        )}
      </div>

      {/* Right column: File Commands */}
      <div className="px-4 flex-1 flex flex-col border-l border-splitter">
        {/* Global file commands */}
        <div className="flex-1 overflow-hidden mb-4">
          <CustomCommandList
            title="File commands"
            commandType="file"
            customCommands={config.customFileCommands}
            onChange={handleGlobalFileCommandsChange}
          />
        </div>

        {/* Repository-specific file commands */}
        {repoConfig && (
          <div className="flex-1 overflow-hidden pt-4">
            <CustomCommandList
              title="File commands (Repository-specific)"
              commandType="file"
              customCommands={repoConfig.customFileCommands}
              onChange={handleRepositoryFileCommandsChange}
              emptyMessage="No repository-specific commands. These commands will only be available in this repository."
            />
          </div>
        )}
      </div>
    </div>
  );
};
