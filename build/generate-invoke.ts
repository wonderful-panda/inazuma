import fs from "node:fs";
import path from "node:path";
import cp from "node:child_process";
import Handlebars from "handlebars";
import type { TsFunc } from "../src-tauri/generate/bindings/TsFunc";
import type { TsArg } from "../src-tauri/generate/bindings/TsArg";
import type { TsType } from "../src-tauri/generate/bindings/TsType";

/**
 * The output path for the generated TypeScript definitions file.
 */
const OUTPUT_PATH = "src/react/generated/tauri-invoke.d.ts";

/**
 * Represents a translated function definition for TypeScript code generation.
 */
type TranslatedFunc = {
  /** The function name */
  name: string;
  /** The TypeScript type string for function parameters */
  payloadType: string;
  /** The TypeScript type string for function return value */
  retType: string;
};

/**
 * Creates the parent directory for a file path if it doesn't exist.
 * @param filePath - The file path for which to create parent directories
 */
const createParentDirectoryIfNeeded = (filePath: string) => {
  const parent = path.dirname(filePath);
  if (!fs.existsSync(parent)) {
    fs.mkdirSync(parent, { recursive: true });
  }
};

/**
 * Utility function to handle unreachable code paths in exhaustive switch statements.
 * @param _ - The never value
 * @throws Always throws an error indicating unreachable code
 */
const unreachable = (_: never): never => {
  throw new Error("This should be unreachable");
};

/**
 * Converts snake_case strings to camelCase.
 * @param value - The snake_case string to convert
 * @returns The camelCase version of the input string
 */
const toCamelCase = (value: string): string =>
  value.replace(/_([a-z])/g, (_, g: string) => g.toUpperCase());
  
/**
 * Recursively traverses a type or function definition and calls the callback for each type encountered.
 * @param target - The type or function to traverse
 * @param callback - Function called for each type encountered during traversal
 */
const traverseType = (target: TsType | TsFunc, callback: (ty: TsType) => void) => {
  if ("kind" in target) {
    callback(target);
    switch (target.kind) {
      case "Optional":
      case "Array":
        traverseType(target.content, callback);
        return;
      case "Tuple":
        target.content.forEach((ty) => traverseType(ty, callback));
        return;
      case "Record":
        traverseType(target.content.key, callback);
        traverseType(target.content.value, callback);
        return;
      case "String":
      case "Number":
      case "Boolean":
      case "Void":
      case "Ignored":
      case "Invalid":
      case "UserDefined":
        return;
      default:
        unreachable(target);
    }
  } else {
    target.args.forEach((arg) => traverseType(arg.ty, callback));
    traverseType(target.ret, callback);
  }
}

/**
 * Converts a TsType to its TypeScript string representation.
 * @param ty - The type to convert to string
 * @returns The TypeScript string representation of the type
 */
const typeToString = (ty: TsType): string => {
  switch (ty.kind) {
    case "String":
    case "Number":
    case "Boolean":
    case "Void":
      return ty.kind.toLowerCase();
    case "Ignored":
    case "Invalid":
      return `${ty.kind}<"${ty.content}">`;
    case "Array":
      return `Array<${typeToString(ty.content)}>`;
    case "Optional": {
      const inner = typeToString(ty.content);
      return ty.content.kind === "Optional" ? inner : `(${inner}) | undefined`;
    }
    case "Record": {
      const key = typeToString(ty.content.key);
      const value = typeToString(ty.content.value);
      return `Record<${key}, ${value}>`;
    }
    case "Tuple":
      return `[${ty.content.map((t) => typeToString(t)).join(", ")}]`;
    case "UserDefined":
      return ty.content;
    default:
      return unreachable(ty);
  }
};

/**
 * Converts function arguments to a TypeScript object type string.
 * @param args - Array of function arguments
 * @returns TypeScript object type string representing the arguments
 */
const argsToString = (args: TsArg[]): string => {
  const content = args
    .filter((a) => a.ty.kind !== "Ignored")
    .map((a) => {
      const name = toCamelCase(a.name) + (a.ty.kind === "Optional" ? "?" : "");
      return `${name}: ${typeToString(a.ty)}`;
    });
  return content.length > 0 ? `{ ${content.join(", ")} }` : "";
};

/**
 * Translates a TsFunc definition to a TranslatedFunc for code generation.
 * @param func - The function definition to translate
 * @returns A translated function suitable for TypeScript code generation
 */
const translateTsFunc = (func: TsFunc): TranslatedFunc => {
  const { name, args, ret } = func;
  return {
    name,
    payloadType: argsToString(args),
    retType: ret.kind === "Ignored" ? "void" : typeToString(ret)
  };
};

/**
 * Generates TypeScript type definitions for Tauri invoke functions.
 * Runs the Rust code generator to extract function definitions and creates TypeScript types.
 * @returns The generated TypeScript code as a string
 */
const generateInvokeType = () => {
  const ret = cp.spawnSync("cargo", "run -- --src ../app/src/commands.rs".split(" "), {
    cwd: "src-tauri/generate",
    stdio: ["ignore", "pipe", "inherit"]
  });
  if (ret.error) {
    throw ret.error;
  }
  const json = ret.stdout.toString("utf-8");
  const funcDefs = (JSON.parse(json) as TsFunc[]).sort((a, b) => a.name.localeCompare(b.name));

  const data: TranslatedFunc[] = funcDefs.map((f) => translateTsFunc(f));
  // add import statements for user defined types
  const imports = new Set<string>();
  funcDefs.forEach(fn => traverseType(fn, ty => {
    if (ty.kind === "UserDefined") {
      imports.add(ty.content);
    }
  }));
  const template = Handlebars.compile(`/* eslint-disable */

/*
 * Generated by build/generate-dts.ts
 *
 * Don't modify this file directly
 */

{{#each imports}}
import { {{{.}}} } from "@backend/{{{.}}}";
{{/each}}

export type TauriInvokeType = {
{{#each data}}
  "{{{name}}}": {
    args: [{{{payloadType}}}],
    ret: {{{retType}}}
  };
{{/each}}
};

export type TauriInvoke = <K extends keyof TauriInvokeType>(
  command: K,
  ...payload: TauriInvokeType[K]["args"]
) => Promise<TauriInvokeType[K]["ret"]>;
`);
  return template({ data, imports: [...imports].sort() });
};

/**
 * Main function that orchestrates the TypeScript definition generation process.
 * Creates the output directory if needed and writes the generated types to file.
 */
const main = () => {
  createParentDirectoryIfNeeded(OUTPUT_PATH);
  fs.writeFileSync(OUTPUT_PATH, generateInvokeType());
};

main();
