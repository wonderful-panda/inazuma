import * as ipcPromise from "ipc-promise";
import { remote, MenuItemConstructorOptions } from "electron";
const { Menu } = remote;

export const browserCommand = new Proxy(
  {},
  {
    get(_target, name: string) {
      return (params: any) => ipcPromise.send(name, params);
    }
  }
) as BrowserCommand;

export function showContextMenu(template: MenuItemConstructorOptions[]): void {
  const menu = Menu.buildFromTemplate(template);
  menu.popup({ window: remote.getCurrentWindow() });
}
