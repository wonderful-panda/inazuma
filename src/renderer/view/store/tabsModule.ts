import Vue from "vue";
import { TabDefinition } from "view/mainTypes";
import { Mutations, Getters, Actions, Module } from "vuex-smart-module";

class TabsState {
  tabs: TabDefinition[] = [];
  selectedIndex: number = -1;
}

class TabsMutations extends Mutations<TabsState> {
  add(payload: { tab: TabDefinition }) {
    const { tabs } = this.state;
    Vue.set(tabs, tabs.length, { lazyProps: undefined, ...payload.tab });
    this.state.selectedIndex = tabs.length - 1;
  }
  remove(payload: { key: string }) {
    const { tabs, selectedIndex } = this.state;
    const index = tabs.findIndex(t => t.key === payload.key);
    if (index < 0) {
      return;
    }
    Vue.delete(tabs, index);
    if (index < selectedIndex) {
      this.state.selectedIndex = selectedIndex - 1;
    } else if (tabs.length <= selectedIndex) {
      this.state.selectedIndex = selectedIndex - 1;
    }
  }
  setSelectedIndex(payload: { index: number }) {
    this.state.selectedIndex = payload.index;
  }
  setTabLazyProps(payload: {
    kind: string;
    key: string;
    lazyProps: {} | undefined;
  }) {
    const { kind, key, lazyProps } = payload;
    const tabs = this.state.tabs;
    const index = tabs.findIndex(t => t.key === key);
    if (index < 0) {
      return;
    }
    const tab = tabs[index];
    if (tab.kind !== kind) {
      throw new Error("unexpected kind");
    }
    tab.lazyProps = lazyProps;
  }

  reset(payload: { tabs: TabDefinition[] }) {
    this.state.tabs = payload.tabs;
    if (0 < payload.tabs.length) {
      this.state.selectedIndex = 0;
    } else {
      this.state.selectedIndex = -1;
    }
  }
}

class TabsGetters extends Getters<TabsState> {
  get selectedTab(): TabDefinition | undefined {
    return this.state.tabs[this.state.selectedIndex];
  }
}

class TabsActions extends Actions<TabsState, TabsGetters, TabsMutations> {
  addOrSelect({ tab }: { tab: TabDefinition }) {
    const index = this.state.tabs.findIndex(t => t.key === tab.key);
    if (index < 0) {
      this.committer.add({ tab });
    } else {
      this.committer.setSelectedIndex({ index });
    }
  }
  setTabLazyProps(payload: {
    kind: string;
    key: string;
    lazyProps: object | undefined;
  }) {
    this.committer.setTabLazyProps(payload);
  }
  remove(payload: { key: string }) {
    this.committer.remove(payload);
  }
  select(payload: { index: number }) {
    this.committer.setSelectedIndex(payload);
  }
  reset(payload: { tabs: TabDefinition[] }) {
    this.committer.reset(payload);
  }
}

export const tabsModule = new Module({
  state: TabsState,
  mutations: TabsMutations,
  getters: TabsGetters,
  actions: TabsActions
});
