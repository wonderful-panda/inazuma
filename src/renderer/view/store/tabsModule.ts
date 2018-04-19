import * as sinai from "sinai";
import Vue from "vue";
import { TabDefinition } from "view/mainTypes";

export class TabsState {
  tabs: TabDefinition[] = [];
  selectedIndex: number = -1;
}

export class TabsMutations extends sinai.Mutations<TabsState>() {
  add(tab: TabDefinition) {
    const { tabs } = this.state;
    Vue.set(tabs, tabs.length, tab);
    this.state.selectedIndex = tabs.length - 1;
  }
  remove(index: number) {
    const { tabs, selectedIndex } = this.state;
    Vue.delete(tabs, index);
    if (index < selectedIndex) {
      this.state.selectedIndex = selectedIndex - 1;
    } else if (tabs.length <= selectedIndex) {
      this.state.selectedIndex = selectedIndex - 1;
    }
  }
  setSelectedIndex(value: number) {
    this.state.selectedIndex = value;
  }
  reset(tabs: TabDefinition[]) {
    this.state.tabs = tabs;
    if (0 < tabs.length) {
      this.state.selectedIndex = 0;
    } else {
      this.state.selectedIndex = -1;
    }
  }
}

export class TabsGetters extends sinai.Getters<TabsState>() {
  get selectedTab(): TabDefinition | undefined {
    return this.state.tabs[this.state.selectedIndex];
  }
}

export class TabsActions extends sinai.Actions<
  TabsState,
  TabsGetters,
  TabsMutations
>() {
  addOrSelect(tab: TabDefinition) {
    const index = this.state.tabs.findIndex(t => t.key === tab.key);
    if (index < 0) {
      this.mutations.add(tab);
    } else {
      this.mutations.setSelectedIndex(index);
    }
  }

  remove(index: number) {
    this.mutations.remove(index);
  }

  select(index: number) {
    this.mutations.setSelectedIndex(index);
  }

  reset(tabs: TabDefinition[]) {
    this.mutations.reset(tabs);
  }
}

export const tabsModule = sinai.module({
  state: TabsState,
  mutations: TabsMutations,
  getters: TabsGetters,
  actions: TabsActions
});
