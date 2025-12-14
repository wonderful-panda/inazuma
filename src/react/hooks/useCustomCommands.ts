import { useAtomValue } from "jotai";
import { useCallback } from "react";
import type { CustomCommand } from "@backend/CustomCommand";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { currentBranchAtom, repoPathAtom } from "@/state/repository";
import { useConfigValue } from "@/state/root";
import { useBeginCustomCommand } from "./actions/beginCustomCommand";

export interface UseCustomCommandsReturn {
  customCommands: CustomCommand[];
  executeCommand: (command: CustomCommand, commit: Commit) => Promise<void>;
  canExecute: (command: CustomCommand, commit: Commit | undefined) => boolean;
  getCommandWithContext: (
    command: CustomCommand,
    commit: Commit | undefined
  ) => { commandLine: string; error?: string };
}

/**
 * Custom command management hook
 *
 * Provides custom command retrieval, execution validation, placeholder replacement,
 * and command execution (PTY/background).
 */
export const useCustomCommands = (): UseCustomCommandsReturn => {
  const config = useConfigValue();
  const repoPath = useAtomValue(repoPathAtom);
  const currentBranch = useAtomValue(currentBranchAtom);

  const customCommands = config.customCommands;
  const beginCustomCommand = useBeginCustomCommand();

  /**
   * Replace placeholders in command line with actual values
   * @returns Command line after replacement, or error message
   */
  const getCommandWithContext = useCallback(
    (command: CustomCommand, commit: Commit | undefined) => {
      let commandLine = command.commandLine;
      const errors: string[] = [];

      // Replace ${repo}
      if (commandLine.includes("${repo}")) {
        if (!repoPath) {
          errors.push("Repository path is not available");
        } else {
          commandLine = commandLine.replace(/\$\{repo\}/g, repoPath);
        }
      }

      // Replace ${branch}
      if (commandLine.includes("${branch}")) {
        if (!currentBranch) {
          errors.push("Current branch is not available");
        } else {
          commandLine = commandLine.replace(/\$\{branch\}/g, currentBranch.name);
        }
      }

      // Replace ${commit}
      if (commandLine.includes("${commit}")) {
        if (!commit) {
          errors.push("Commit is not selected");
        } else {
          commandLine = commandLine.replace(/\$\{commit\}/g, commit.id);
        }
      }

      if (errors.length > 0) {
        return { commandLine: command.commandLine, error: errors.join(", ") };
      }

      return { commandLine };
    },
    [repoPath, currentBranch]
  );

  /**
   * Check if command can be executed
   * Validates that all required placeholder values are available
   */
  const canExecute = useCallback(
    (command: CustomCommand, commit: Commit | undefined) => {
      const result = getCommandWithContext(command, commit);
      return !result.error;
    },
    [getCommandWithContext]
  );

  /**
   * Execute command
   */
  const executeCommand = useCallback(
    async (command: CustomCommand, commit: Commit) => {
      const result = getCommandWithContext(command, commit);
      if (result.error) {
        throw new Error(result.error);
      }
      if (command.useBuiltinTerminal) {
        await beginCustomCommand(command.name, command.description, result.commandLine);
      } else {
        await invokeTauriCommand("exec_custom_command_detached", {
          repoPath: repoPath || undefined,
          commandLine: result.commandLine
        });
      }
    },
    [getCommandWithContext, repoPath, beginCustomCommand]
  );

  return {
    customCommands,
    executeCommand,
    canExecute,
    getCommandWithContext
  };
};
