import { VNode } from "vue";
import { storeComponent } from "../store";
import BaseLayout from "./BaseLayout";
import TabLog from "./RepositoryPageTabLog";
import TabFile from "./RepositoryPageTabFile";
import TabTree from "./RepositoryPageTabTree";
import SideBarBranches from "./SideBarBranches";
import SideBarRemotes from "./SideBarRemotes";
import VIconButton from "./base/VIconButton";
import VTabs from "./base/VTabs";
import DrawerNavigation from "./DrawerNavigation";
import { __sync } from "../utils/modifiers";
import { TabDefinition } from "../mainTypes";

// @vue/component
export default storeComponent.create({
  computed: {
    sidebar(): VNode | undefined {
      switch (this.state.sidebar) {
        case "branches":
          return <SideBarBranches />;
        case "remotes":
          return <SideBarRemotes />;
        default:
          return undefined;
      }
    },
    selectedTabIndex: {
      get(): number {
        return this.state.tabs.selectedIndex;
      },
      set(value: number): void {
        this.actions.tabs.select(value);
      }
    }
  },
  methods: {
    reload() {
      location.reload();
    },
    runInteractiveShell() {
      this.actions.runInteractiveShell();
    },
    renderTab(tab: TabDefinition): VNode {
      if (tab.kind === "log") {
        return <TabLog />;
      } else if (tab.kind === "file") {
        return <TabFile path={tab.params.path} sha={tab.params.sha} />;
      } else if (tab.kind === "tree") {
        return <TabTree sha={tab.params.sha} />;
      } else {
        console.error("unknown tab kind", tab);
        return <div />;
      }
    }
  },
  render(): VNode {
    const { state, getters, actions } = this;
    return (
      <BaseLayout title={getters.repoName}>
        <template slot="titlebar-buttons">
          <VIconButton
            mini
            disabled={!state.config.interactiveShell}
            tooltip="launch interactive shell"
            action={this.runInteractiveShell}
          >
            input
          </VIconButton>
          <VIconButton mini tooltip="reload" action={this.reload}>
            refresh
          </VIconButton>
        </template>
        <template slot="drawer-navigations">
          <DrawerNavigation
            icon="local_offer"
            text="Branches"
            action={() => actions.showSidebar("branches")}
          />
          <DrawerNavigation
            icon="cloud"
            text="Remotes"
            action={() => actions.showSidebar("remotes")}
          />
          <DrawerNavigation
            icon="settings"
            text="Preferences"
            action={actions.showPreference}
          />
          <DrawerNavigation
            icon="home"
            text="Go to Home"
            action={this.actions.showWelcomePage}
          />
          <DrawerNavigation
            icon="info_outline"
            text="About"
            action={actions.showVersionDialog}
          />
        </template>
        <keep-alive>{this.sidebar}</keep-alive>
        <VTabs
          tabs={state.tabs.tabs}
          selectedIndex={__sync(this.selectedTabIndex)}
          closeTab={actions.tabs.remove}
          scopedSlots={{
            default: ({ tab }) => [this.renderTab(tab)]
          }}
        />
      </BaseLayout>
    );
  }
});
