import Electron from "electron";
import { config, environment } from "./persistent";
import wm from "./windowManager";
import { parseCommandLine } from "./options";
import { registerHandlers } from "./registerHandlers";
import installExtension, {
  REACT_DEVELOPER_TOOLS,
  REDUX_DEVTOOLS
} from "electron-devtools-installer";
import path from "path";
import { findRepositoryRootAsync } from "inazuma-rust-backend";
import { repositorySessions } from "./repositorySession";
import * as handlers from "./handlers";

const options = parseCommandLine();

registerHandlers(handlers);

Electron.app.on("window-all-closed", () => {
  config.save();
  environment.save();
  repositorySessions.dispose();
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
        click: () => showMainWindow(undefined)
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

function showMainWindow(initialRepository: string | undefined) {
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
  const baseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : `file://${__dirname.replace("\\", "/")}/../renderer/index.html`;
  const hash = initialRepository ? `#${encodeURI(initialRepository)}` : "";
  mainWindow.loadURL(baseUrl + hash);
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
  let initialRepository;
  try {
    initialRepository = await findRepositoryRootAsync();
  } catch (e) {
    console.log("failed to find containing repository:", e);
    initialRepository = undefined;
  }
  showMainWindow(initialRepository);
});
