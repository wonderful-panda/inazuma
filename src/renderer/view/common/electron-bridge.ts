import { remote, MenuItemConstructorOptions } from "electron";
const { Menu } = remote;

export function showContextMenu(template: MenuItemConstructorOptions[]): void {
  const menu = Menu.buildFromTemplate(template);
  menu.popup(remote.getCurrentWindow());
}
