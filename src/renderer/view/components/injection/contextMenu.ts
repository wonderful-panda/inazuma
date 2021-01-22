import { InjectionKey, inject, provide } from "@vue/composition-api";

export type ContextMenuItem =
  | {
      readonly id: string;
      readonly label: string;
      readonly disabled?: boolean;
      action(): void;
    }
  | "separator";

export type ContextMenuHandler = {
  show(e: MouseEvent, items: readonly ContextMenuItem[]): void;
};

const nope: ContextMenuHandler = {
  show: () => {}
};

const key: InjectionKey<ContextMenuHandler> = Symbol("inazuma.vue.injection.ContextMenu");

export function injectContextMenu(): ContextMenuHandler {
  return inject(key) || nope;
}

export function provideContextMenu(value: ContextMenuHandler): void {
  provide(key, value);
}
