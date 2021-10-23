import Electron from "electron";
import { config, environment } from "./persistent";
import wm from "./windowManager";
import { setupRepositorySessions } from "./repositorySession";
import { setupBrowserCommands } from "./actions";
import { parseCommandLine } from "./options";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS
} from "electron-devtools-installer";
import path from "path";

const options = parseCommandLine();

const repoSessions = setupRepositorySessions();
setupBrowserCommands(repoSessions);

Electron.app.on("window-all-closed", () => {
  config.save();
  environment.save();
  repoSessions.dispose();
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
        accelerator: process.platform === "darwin" ? "Alt+Command+N" : "Ctrl+Shift+N",
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
        label: "Hard &Reload",
        accelerator: "Ctrl+Shift+R",
        click: (_item, focusedWindow) => {
          focusedWindow?.reload();
        }
      },
      {
        label: "Toggle &Developer Tools",
        accelerator: process.platform === "darwin" ? "Alt+Command+I" : "Ctrl+Shift+I",
        click: (_item, focusedWindow) => {
          focusedWindow?.webContents.toggleDevTools();
        }
      }
    ]
  }
];

function showMainWindow() {
  const mainWindow = wm.create({
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload/preload.js")
    }
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
  mainWindow.loadURL("http://localhost:3000");
  mainWindow.show();
}

Electron.app.on("ready", async () => {
  if (options.enableDevtools) {
    try {
      const reactDevTools = await installExtension(REACT_DEVELOPER_TOOLS);
      console.log("load devtools extension:", reactDevTools);
      const reduxDevTools = await installExtension(REDUX_DEVTOOLS);
      console.log("load devtools extension:", reduxDevTools);
    } catch (e) {
      console.log("failed to load devtools extension:", e);
    }
  }
  showMainWindow();
});
