import commandLineArgs, { OptionDefinition } from "command-line-args";

const optionDefinitions = [{ name: "enable-devtools", type: Boolean }] as OptionDefinition[];

export type CommandLineArgs = {
  enableDevtools?: boolean;
  _unknown?: string[];
};

export function parseCommandLine(): CommandLineArgs {
  return commandLineArgs(optionDefinitions, { partial: true, camelCase: true });
}
