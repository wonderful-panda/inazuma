import * as _ from "lodash";
import * as Electron from "electron";

const html = "../static/index.html";

Electron.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        Electron.app.quit();
    }
});

let mainWindow: Electron.BrowserWindow;

Electron.app.on("ready", () => {
    mainWindow = new Electron.BrowserWindow();
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.loadURL(`file://${__dirname}/${html}`);
});
