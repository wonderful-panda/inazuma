import * as vca from "vue-tsx-support/lib/vca";
import BaseLayout from "./BaseLayout";
import TabLog from "./RepositoryPageTabLog";
import SideBarBranches from "./SideBarBranches";
import SideBarRemotes from "./SideBarRemotes";
import Terminal from "./Terminal";
import VSplitterPanel from "./base/VSplitterPanel";
import VTabs from "./base/VTabs";
import DrawerNavigation from "./DrawerNavigation";
import TitleBarButton from "./TitleBarButton";
import { __sync } from "../utils/modifiers";
import { RepositoryTabDefinition, SplitterDirection } from "../mainTypes";
import { useRootModule, useTabsModule } from "view/store";
import { asAsyncComponent } from "view/utils/async-component";
import { computed } from "@vue/composition-api";
import {
  injectStorage,
  provideStorageWithAdditionalNamespace,
  useStorage
} from "./injection/storage";

const TabFile = asAsyncComponent(() =>
  import(
    /* webpackChunkName: "repositorypagetabfile", webpackPrefetch: true */
    "./RepositoryPageTabFile"
  ).then(mod => mod.default)
);
const TabTree = asAsyncComponent(() =>
  import(
    /* webpackChunkName: "repositorypagetabtree", webpackPrefetch: true */
    "./RepositoryPageTabTree"
  ).then(mod => mod.default)
);

const SideBar = _fc<{ name: string }>(ctx => {
  switch (ctx.props.name) {
    case "branches":
      return <SideBarBranches />;
    case "remotes":
      return <SideBarRemotes />;
    default:
      return <div v-show={false} />;
  }
});

const TabContent = _fc<{ tab: RepositoryTabDefinition }>(ctx => {
  const tab = ctx.props.tab;
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
    return <div />;
  }
});

export default vca.component({
  setup() {
    const storage = injectStorage();
    const persist = useStorage(
      { splitter: { ratio: 0.8, direction: "vertical" as SplitterDirection } },
      storage,
      "RepositoryPage"
    );
    provideStorageWithAdditionalNamespace("repository", storage);
    const rootModule = useRootModule();
    const tabsModule = useTabsModule();
    const selectedTabIndex = computed({
      get: () => tabsModule.state.selectedIndex,
      set: v => tabsModule.actions.select({ index: v })
    });
    const showSidebarBranches = () =>
      rootModule.actions.showSidebar({ name: "branches" });
    const showSidebarRemotes = () =>
      rootModule.actions.showSidebar({ name: "remotes" });
    const showPreference = () => rootModule.actions.showPreference();
    const showWelcomePage = () => rootModule.actions.showWelcomePage();
    const showVersionDialog = () => rootModule.actions.showVersionDialog();
    const toggleTerminal = () => rootModule.actions.toggleTerminal();
    const closeTab = (key: string) => rootModule.actions.removeTab({ key });

    return () => {
      const { state, getters, actions } = rootModule;
      return (
        <BaseLayout title={state.repoPath}>
          <template slot="drawer-navigations">
            <DrawerNavigation
              icon="local_offer"
              text="Branches"
              action={showSidebarBranches}
            />
            <DrawerNavigation
              icon="cloud"
              text="Remotes"
              action={showSidebarRemotes}
            />
            <DrawerNavigation
              icon="settings"
              text="Preferences"
              action={showPreference}
            />
            <DrawerNavigation
              icon="home"
              text="Go to Home"
              action={showWelcomePage}
            />
            <DrawerNavigation
              icon="info_outline"
              text="About"
              action={showVersionDialog}
            />
          </template>
          <template slot="titlebar-buttons">
            <TitleBarButton action={toggleTerminal}>keyboard</TitleBarButton>
          </template>
          <keep-alive>
            <SideBar name={state.sidebar} />
          </keep-alive>
          <VSplitterPanel
            style={{ flex: 1 }}
            allowDirectionChange
            ratio={__sync(persist.splitter.ratio)}
            direction={__sync(persist.splitter.direction)}
            splitterWidth={5}
            showSecond={state.terminalShown}
          >
            <VTabs
              slot="first"
              tabs={getters.repositoryTabs}
              selectedIndex={__sync(selectedTabIndex.value)}
              closeTab={closeTab}
              scopedSlots={{
                default: ({ tab }) => (
                  <TabContent tab={tab as RepositoryTabDefinition} />
                )
              }}
            />
            <keep-alive slot="second">
              {state.terminalShown && !!state.config.interactiveShell ? (
                <Terminal
                  cwd={state.repoPath}
                  cmd={state.config.interactiveShell}
                  hide={actions.hideTerminal}
                />
              ) : (
                undefined
              )}
            </keep-alive>
          </VSplitterPanel>
        </BaseLayout>
      );
    };
  }
});
