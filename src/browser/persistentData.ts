import * as path from "path";
import * as Electron from "electron";
import * as fs from "fs";
import { Validator } from "jsonschema";

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
export const configSchema = {
    id: "/Config",
    type: "Object",
    properties: {
        recentListCount: {
            type: "integer",
            minimum: "0"
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

class ConfigObject {
    constructor(public data: Config) {
    }
}

function loadConfig(): Config {
    const defaultData: Config = { recentListCount: 5, externalDiffTool: "", interactiveShell: "", vueDevTool: "" };
    const ret = load(configJsonPath, configSchema);
    if (!ret) {
        return defaultData;
    } else {
        return Object.assign(defaultData, ret);
    }
}

export function saveConfig() {
    save(configJsonPath, configSchema, config.data);
}

export const config = new ConfigObject(loadConfig());

/*
 * environment
 */
const environmentJsonPath = path.join(folder, ".environment.json");
const environmentSchema = {
    id: "/Environment",
    type: "Object",
    properties: {
        recentOpened: {
            type: "array",
            items: { type: "string" }
        }
    }
};

class EnvironmentObject {
    constructor(public data: Environment, public config: Config) {
    }

    addRecentOpened(repoPath: string): boolean {
        const recents = [ ...this.data.recentOpened ];
        const idx = recents.indexOf(repoPath);
        if (idx === 0) {
            return false;
        } else if (0 < idx) {
            recents.splice(idx, 1);
        }
        recents.unshift(repoPath);
        if (this.config.recentListCount < recents.length) {
            recents.splice(this.config.recentListCount);
        }
        this.data.recentOpened = recents;
        return true;
    }
}

function loadEnvironment(): Environment {
    const defaultData: Environment = { recentOpened: [] };
    const ret = load(environmentJsonPath, environmentSchema);
    if (!ret) {
        return defaultData;
    } else {
        return Object.assign(defaultData, ret);
    }
}

export function saveEnvironment() {
    save(environmentJsonPath, environmentSchema, environment.data);
}

export const environment = new EnvironmentObject(loadEnvironment(), config.data);
