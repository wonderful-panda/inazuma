import * as _ from "lodash";
import * as Electron from "electron";
import * as persist from "./persistentData";
import wm from "./windowManager";
import { setup as setupTempdir } from "./tempdir";

import { setupBrowserCommands } from "./actions";
setupBrowserCommands();

global["environment"] = persist.environment.data;
global["config"] = persist.config.data;

const html = "../static/index.html";

const tempdir = setupTempdir();

Electron.app.on("window-all-closed", () => {
    persist.saveConfig();
    persist.saveEnvironment();
    tempdir.creanup();
    if (process.platform !== "darwin") {
        Electron.app.quit();
    }
});

Electron.app.on("ready", () => {
    const template: Electron.MenuItemConstructorOptions[] = [
        {
            label: "&File",
            submenu: [
                { label: "E&xit", "accelerator": "CmdOrCtrl+W",  role: "close" }
            ]
        },
        {
            label: "&View",
            submenu: [
                {
                    label: "&Reload",
                    accelerator: "Ctrl+R",
                    click: (item, focusedWindow) => { focusedWindow.reload(); }
                },
                {
                    label: "Toggle &Developer Tools",
                    accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
                    click: (item, focusedWindow) => { focusedWindow.webContents.toggleDevTools(); }
                },
            ]
        }
    ];
    const mainWindow = wm.create({
        autoHideMenuBar: true
    });
    mainWindow.setMenu(Electron.Menu.buildFromTemplate(template))
    mainWindow.loadURL(`file://${__dirname}/${html}`);
});
