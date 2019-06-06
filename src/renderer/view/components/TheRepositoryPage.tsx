import { VNode } from "vue";
import BaseLayout from "./BaseLayout";
import TabLog from "./RepositoryPageTabLog";
import TabFile from "./RepositoryPageTabFile";
import TabTree from "./RepositoryPageTabTree";
import SideBarBranches from "./SideBarBranches";
import SideBarRemotes from "./SideBarRemotes";
import Terminal from "./Terminal";
import VSplitterPanel from "./base/VSplitterPanel";
import VTabs from "./base/VTabs";
import DrawerNavigation from "./DrawerNavigation";
import TitleBarButton from "./TitleBarButton";
import { __sync } from "../utils/modifiers";
import { RepositoryTabDefinition, SplitterDirection } from "../mainTypes";
import { rootModule, withStore } from "view/store";
import * as ds from "view/store/displayState";
import { tabsModule } from "view/store/tabsModule";

const displayState = ds.createMixin(
  {
    splitter: { ratio: 0.8, direction: "vertical" as SplitterDirection }
  },
  { key: "RepositoryPage", root: true }
);
// @vue/component
export default withStore.mixin(displayState).create({
  computed: {
    ...rootModule.mapGetters(["repoName", "repositoryTabs"]),
    sidebarVNode(): VNode | undefined {
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
      set(index: number): void {
        this.selectTab({ index });
      }
    }
  },
  methods: {
    ...rootModule.mapActions([
      "showSidebar",
      "showPreference",
      "showWelcomePage",
      "showVersionDialog",
      "removeTab",
      "toggleTerminal"
    ]),
    ...tabsModule.mapActions({ selectTab: "select" }),
    showSidebarBranches() {
      this.showSidebar({ name: "branches" });
    },
    showSidebarRemotes() {
      this.showSidebar({ name: "branches" });
    },
    reload() {
      location.reload();
    },
    closeTab(key: string) {
      this.removeTab({ key });
    },
    renderTab(tab: RepositoryTabDefinition): VNode {
      if (tab.kind === "log") {
        return <TabLog />;
      } else if (tab.kind === "file") {
        const { key, props, lazyProps } = tab;
        return (
          <TabFile
            tabkey={key}
            path={props.relPath}
            sha={props.sha}
            blame={lazyProps && lazyProps.blame}
          />
        );
      } else if (tab.kind === "tree") {
        const { key, props, lazyProps } = tab;
        return (
          <TabTree
            tabkey={key}
            sha={props.sha}
            rootNodes={lazyProps && lazyProps.rootNodes}
          />
        );
      } else {
        console.error("unknown tab kind", tab);
        return <div />;
      }
    }
  },
  render(): VNode {
    const { repoPath, terminalShown, config } = this.state;
    return (
      <BaseLayout title={repoPath}>
        <template slot="drawer-navigations">
          <DrawerNavigation
            icon="local_offer"
            text="Branches"
            action={this.showSidebarBranches}
          />
          <DrawerNavigation
            icon="cloud"
            text="Remotes"
            action={this.showSidebarRemotes}
          />
          <DrawerNavigation
            icon="settings"
            text="Preferences"
            action={this.showPreference}
          />
          <DrawerNavigation
            icon="home"
            text="Go to Home"
            action={this.showWelcomePage}
          />
          <DrawerNavigation
            icon="info_outline"
            text="About"
            action={this.showVersionDialog}
          />
        </template>
        <template slot="titlebar-buttons">
          <TitleBarButton action={this.toggleTerminal}>keyboard</TitleBarButton>
        </template>
        <keep-alive>{this.sidebarVNode}</keep-alive>
        <VSplitterPanel
          style={{ flex: 1 }}
          allowDirectionChange
          ratio={__sync(this.displayState.splitter.ratio)}
          direction={__sync(this.displayState.splitter.direction)}
          splitterWidth={5}
          showSecond={terminalShown}
        >
          <VTabs
            slot="first"
            tabs={this.repositoryTabs}
            selectedIndex={__sync(this.selectedTabIndex)}
            closeTab={this.closeTab}
            scopedSlots={{
              default: ({ tab }) => [
                this.renderTab(tab as RepositoryTabDefinition)
              ]
            }}
          />
          <keep-alive slot="second">
            {terminalShown && !!config.interactiveShell ? (
              <Terminal cwd={repoPath} cmd={config.interactiveShell} />
            ) : (
              undefined
            )}
          </keep-alive>
        </VSplitterPanel>
      </BaseLayout>
    );
  }
});
