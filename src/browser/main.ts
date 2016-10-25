import * as _ from "lodash";
import * as Electron from "electron";
import * as menus from "./menus";

const html = "../static/index.html";

Electron.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        Electron.app.quit();
    }
});

let mainWindow: Electron.BrowserWindow;

Electron.app.on("ready", () => {
    const template: Electron.MenuItemOptions[] = [
        {
            label: "&File",
            submenu: [
                { label: "Open repository", click: menus.openRepository },
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
    Electron.Menu.setApplicationMenu(Electron.Menu.buildFromTemplate(template));
    mainWindow = new Electron.BrowserWindow();
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.loadURL(`file://${__dirname}/${html}`);
});
