import * as Electron from "electron";
import { config, environment } from "./persistentData";
import wm from "./windowManager";
import { setupRepositorySessions } from "./repositorySession";
import { setupBrowserCommands } from "./actions";
const repoSessions = setupRepositorySessions();
setupBrowserCommands(repoSessions);

(global as any)["environment"] = environment.data;
(global as any)["config"] = config.data;

const html = "../renderer/static/index.html";

Electron.app.on("window-all-closed", () => {
  config.save();
  environment.save();
  repoSessions.dispose();
  const devtools = Electron.BrowserWindow.getDevToolsExtensions() as {
    [name: string]: any;
  };
  Object.keys(devtools).map(Electron.BrowserWindow.removeDevToolsExtension);
  if (process.platform !== "darwin") {
    Electron.app.quit();
  }
});

const template: Electron.MenuItemConstructorOptions[] = [
  {
    label: "&File",
    submenu: [
      {
        label: "New window",
        accelerator:
          process.platform === "darwin" ? "Alt+Command+N" : "Ctrl+Shift+N",
        click: showMainWindow
      },
      {
        label: "E&xit",
        accelerator: "CmdOrCtrl+W",
        role: "close"
      }
    ]
  },
  {
    label: "&View",
    submenu: [
      {
        label: "&Reload",
        accelerator: "Ctrl+R",
        click: (_item, focusedWindow) => {
          focusedWindow.reload();
        }
      },
      {
        label: "Toggle &Developer Tools",
        accelerator:
          process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
        click: (_item, focusedWindow) => {
          focusedWindow.webContents.toggleDevTools();
        }
      }
    ]
  }
];

function showMainWindow() {
  const mainWindow = wm.create({
    autoHideMenuBar: true,
    show: false
  });
  // restore window size
  const size = environment.data.windowSize;
  if (size) {
    mainWindow.setSize(size.width, size.height);
  }
  mainWindow.center();
  if (size && size.maximized) {
    mainWindow.maximize();
  }
  mainWindow.on("close", () => {
    // save window size
    const maximized = mainWindow.isMaximized();
    mainWindow.restore();
    const [width, height] = mainWindow.getSize();
    environment.setWindowSize(width, height, maximized);
  });
  mainWindow.setMenu(Electron.Menu.buildFromTemplate(template));
  mainWindow.loadURL(`file://${__dirname}/${html}`);
  mainWindow.show();
}

Electron.app.on("ready", () => {
  if (config.data.vueDevTool) {
    try {
      Electron.BrowserWindow.addDevToolsExtension(config.data.vueDevTool);
    } catch (e) {
      console.log("failed to load devtools extension");
    }
  }
  showMainWindow();
});
