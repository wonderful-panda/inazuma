import * as path from "path";
import Electron from "electron";
import * as fs from "fs";
import { Validator, Schema } from "jsonschema";

const validator = new Validator();
const folder = Electron.app.getPath("userData");

function load(file: string, schema: any) {
  if (!fs.existsSync(file)) {
    return undefined;
  }
  try {
    const data = fs.readFileSync(file, "utf8");
    const obj = JSON.parse(data);
    const result = validator.validate(obj, schema);
    if (result.errors.length === 0) {
      return obj;
    } else {
      console.error(`invalid JSON data found in ${name}`, result.errors);
      return undefined;
    }
  } catch (e) {
    console.error(`failed to load JSON data from ${name}`, e);
    return undefined;
  }
}

function replaceObjectContent(dest: any, src: any) {
  Object.getOwnPropertyNames(dest).forEach(name => {
    delete dest[name];
  });
  Object.assign(dest, src);
}

function save(file: string, schema: any, data: any) {
  const result = validator.validate(data, schema);
  if (result.errors.length > 0) {
    throw result.errors;
  }
  const content = JSON.stringify(data, null, 2);
  fs.writeFileSync(file, content, "utf8");
}

/*
 * config
 */
const configJsonPath = path.join(folder, "config.json");
export const configSchema: Schema = {
  id: "/Config",
  type: "Object",
  properties: {
    fontFamily: {
      type: "object",
      properties: {
        standard: { type: "string" },
        monospace: { type: "string" }
      }
    },
    recentListCount: {
      type: "integer",
      minimum: 0
    },
    externalDiffTool: {
      type: "string"
    },
    interactiveShell: {
      type: "string"
    },
    vueDevTool: {
      type: "string"
    }
  }
};

const defaultConfigData: Config = {
  fontFamily: {},
  recentListCount: 5,
  externalDiffTool: "",
  interactiveShell: "",
  vueDevTool: ""
};

export const config = {
  data: Object.assign(
    defaultConfigData,
    load(configJsonPath, configSchema)
  ) as Config,
  updateData(newData: Config) {
    replaceObjectContent(this.data, newData);
  },
  save() {
    save(configJsonPath, configSchema, this.data);
  }
};

/*
 * environment
 */
const environmentJsonPath = path.join(folder, ".environment.json");
const environmentSchema: Schema = {
  id: "/Environment",
  type: "Object",
  properties: {
    recentOpened: {
      type: "array",
      items: { type: "string" }
    },
    windowSize: {
      type: "Object",
      properties: {
        width: {
          type: "integer"
        },
        height: {
          type: "integer"
        },
        maximized: {
          type: "boolean"
        }
      }
    }
  },
  required: ["recentOpened"]
};

const defaultEnvironData: Environment = {};

export const environment = {
  data: Object.assign(
    defaultEnvironData,
    load(environmentJsonPath, environmentSchema)
  ) as Environment,
  updateData(newData: Environment) {
    replaceObjectContent(this.data, newData);
  },
  save() {
    save(environmentJsonPath, environmentSchema, this.data);
  },
  setWindowSize(width: number, height: number, maximized: boolean) {
    this.data.windowSize = { width, height, maximized };
  }
};
