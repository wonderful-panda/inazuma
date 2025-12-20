import type { CommitCustomCommand } from "@backend/CommitCustomCommand";
import type { FileCustomCommand } from "@backend/FileCustomCommand";
import { useAtomValue } from "jotai";
import { useCallback, useMemo } from "react";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { repoConfigAtom, repoPathAtom } from "@/state/repository";
import { useConfigValue } from "@/state/root";
import { useBeginCustomCommand } from "./actions/beginCustomCommand";

export interface UseCustomCommandsReturn {
  commitCommands: CommitCustomCommand[];
  fileCommands: FileCustomCommand[];
  globalCommitCommands: CommitCustomCommand[];
  globalFileCommands: FileCustomCommand[];
  repositoryCommitCommands: CommitCustomCommand[];
  repositoryFileCommands: FileCustomCommand[];
  executeCommitCommand: (command: CommitCustomCommand, commit: Commit) => Promise<void>;
  executeFileCommand: (command: FileCustomCommand, filePath: string, commit: Commit | undefined) => Promise<void>;
  canExecuteCommitCommand: (command: CommitCustomCommand, commit: Commit | undefined) => boolean;
  canExecuteFileCommand: (command: FileCustomCommand, filePath: string) => boolean;
  getCommitCommandWithContext: (
    command: CommitCustomCommand,
    commit: Commit | undefined
  ) => { commandLine: string; error?: string };
  getFileCommandWithContext: (
    command: FileCustomCommand,
    filePath: string,
    commit: Commit | undefined
  ) => { commandLine: string; error?: string };
}

/**
 * Custom command management hook
 *
 * Provides custom command retrieval, execution validation, placeholder replacement,
 * and command execution (PTY/background) for both commit and file commands.
 */
export const useCustomCommands = (): UseCustomCommandsReturn => {
  const config = useConfigValue();
  const repoPath = useAtomValue(repoPathAtom);
  const repoConfig = useAtomValue(repoConfigAtom);

  // Global commands
  const globalCommitCommands = useMemo(() => config.customCommands || [], [config.customCommands]);
  const globalFileCommands = useMemo(() => config.customFileCommands || [], [config.customFileCommands]);

  // Repository-specific commands
  const repositoryCommitCommands = useMemo(
    () => repoConfig?.customCommands || [],
    [repoConfig?.customCommands]
  );
  const repositoryFileCommands = useMemo(
    () => repoConfig?.customFileCommands || [],
    [repoConfig?.customFileCommands]
  );

  // Merge global and repository-specific commands
  const commitCommands = useMemo(() => {
    return [...globalCommitCommands, ...repositoryCommitCommands];
  }, [globalCommitCommands, repositoryCommitCommands]);

  const fileCommands = useMemo(() => {
    return [...globalFileCommands, ...repositoryFileCommands];
  }, [globalFileCommands, repositoryFileCommands]);

  const beginCustomCommand = useBeginCustomCommand();

  /**
   * Replace placeholders in commit command line with actual values
   * @returns Command line after replacement, or error message
   */
  const getCommitCommandWithContext = useCallback(
    (command: CommitCustomCommand, commit: Commit | undefined) => {
      let commandLine = command.commandLine;
      const errors: string[] = [];

      // Replace ${repo}
      // biome-ignore lint/suspicious/noTemplateCurlyInString: expected
      if (commandLine.includes("${repo}")) {
        if (!repoPath) {
          errors.push("Repository path is not available");
        } else {
          // Convert path separators to backslash on Windows
          const isWindows = navigator.userAgent.toLowerCase().includes("win");
          const pathToUse = isWindows ? repoPath.replace(/\//g, "\\") : repoPath;
          commandLine = commandLine.replace(/\$\{repo\}/g, pathToUse);
        }
      }

      // Replace ${commit}
      // biome-ignore lint/suspicious/noTemplateCurlyInString: expected
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
    [repoPath]
  );

  /**
   * Replace placeholders in file command line with actual values
   * @returns Command line after replacement, or error message
   */
  const getFileCommandWithContext = useCallback(
    (command: FileCustomCommand, filePath: string, commit: Commit | undefined) => {
      let commandLine = command.commandLine;
      const errors: string[] = [];

      // Replace ${repo}
      // biome-ignore lint/suspicious/noTemplateCurlyInString: expected
      if (commandLine.includes("${repo}")) {
        if (!repoPath) {
          errors.push("Repository path is not available");
        } else {
          const isWindows = navigator.userAgent.toLowerCase().includes("win");
          const pathToUse = isWindows ? repoPath.replace(/\//g, "\\") : repoPath;
          commandLine = commandLine.replace(/\$\{repo\}/g, pathToUse);
        }
      }

      // Replace ${commit}
      // biome-ignore lint/suspicious/noTemplateCurlyInString: expected
      if (commandLine.includes("${commit}")) {
        if (!commit) {
          errors.push("Commit is not selected");
        } else {
          commandLine = commandLine.replace(/\$\{commit\}/g, commit.id);
        }
      }

      // Replace file-specific placeholders
      // ${file} - relative path
      // biome-ignore lint/suspicious/noTemplateCurlyInString: expected
      if (commandLine.includes("${file}")) {
        commandLine = commandLine.replace(/\$\{file\}/g, filePath);
      }

      // ${absfile} - absolute path
      // biome-ignore lint/suspicious/noTemplateCurlyInString: expected
      if (commandLine.includes("${absfile}")) {
        if (!repoPath) {
          errors.push("Repository path is not available");
        } else {
          const absPath = `${repoPath}/${filePath}`;
          const isWindows = navigator.userAgent.toLowerCase().includes("win");
          const pathToUse = isWindows ? absPath.replace(/\//g, "\\") : absPath;
          commandLine = commandLine.replace(/\$\{absfile\}/g, pathToUse);
        }
      }

      // ${filename} - file name only
      // biome-ignore lint/suspicious/noTemplateCurlyInString: expected
      if (commandLine.includes("${filename}")) {
        const fileName = filePath.split("/").pop() || filePath;
        commandLine = commandLine.replace(/\$\{filename\}/g, fileName);
      }

      // ${dir} - directory relative path
      // biome-ignore lint/suspicious/noTemplateCurlyInString: expected
      if (commandLine.includes("${dir}")) {
        const dir = filePath.split("/").slice(0, -1).join("/") || ".";
        commandLine = commandLine.replace(/\$\{dir\}/g, dir);
      }

      // ${absdir} - directory absolute path
      // biome-ignore lint/suspicious/noTemplateCurlyInString: expected
      if (commandLine.includes("${absdir}")) {
        if (!repoPath) {
          errors.push("Repository path is not available");
        } else {
          const dir = filePath.split("/").slice(0, -1).join("/") || ".";
          const absDir = `${repoPath}/${dir}`;
          const isWindows = navigator.userAgent.toLowerCase().includes("win");
          const pathToUse = isWindows ? absDir.replace(/\//g, "\\") : absDir;
          commandLine = commandLine.replace(/\$\{absdir\}/g, pathToUse);
        }
      }

      if (errors.length > 0) {
        return { commandLine: command.commandLine, error: errors.join(", ") };
      }

      return { commandLine };
    },
    [repoPath]
  );

  /**
   * Check if commit command can be executed
   * Validates that all required placeholder values are available
   */
  const canExecuteCommitCommand = useCallback(
    (command: CommitCustomCommand, commit: Commit | undefined) => {
      const result = getCommitCommandWithContext(command, commit);
      return !result.error;
    },
    [getCommitCommandWithContext]
  );

  /**
   * Check if file command can be executed
   * Validates that all required placeholder values are available and file pattern matches
   */
  const canExecuteFileCommand = useCallback(
    (command: FileCustomCommand, filePath: string) => {
      // Check file pattern if specified
      if (command.filePattern) {
        try {
          const regex = new RegExp(command.filePattern);
          if (!regex.test(filePath)) {
            return false;
          }
        } catch {
          // Invalid regex pattern - skip this command
          return false;
        }
      }
      return true;
    },
    []
  );

  /**
   * Execute commit command
   */
  const executeCommitCommand = useCallback(
    async (command: CommitCustomCommand, commit: Commit) => {
      const result = getCommitCommandWithContext(command, commit);
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
    [getCommitCommandWithContext, repoPath, beginCustomCommand]
  );

  /**
   * Execute file command
   */
  const executeFileCommand = useCallback(
    async (command: FileCustomCommand, filePath: string, commit: Commit | undefined) => {
      const result = getFileCommandWithContext(command, filePath, commit);
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
    [getFileCommandWithContext, repoPath, beginCustomCommand]
  );

  return {
    commitCommands,
    fileCommands,
    globalCommitCommands,
    globalFileCommands,
    repositoryCommitCommands,
    repositoryFileCommands,
    executeCommitCommand,
    executeFileCommand,
    canExecuteCommitCommand,
    canExecuteFileCommand,
    getCommitCommandWithContext,
    getFileCommandWithContext
  };
};
