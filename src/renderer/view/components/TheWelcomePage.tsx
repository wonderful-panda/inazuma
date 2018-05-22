import { VNode } from "vue";
import * as Electron from "electron";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { componentWithStore } from "../store";
import BaseLayout from "./BaseLayout";
import DrawerNavigation from "./DrawerNavigation";
import { getFileName, normalizePathSeparator } from "core/utils";
import { navigate } from "../route";
import * as md from "view/utils/md-classes";
import * as style from "./TheWelcomePage.scss";
const { dialog, BrowserWindow } = Electron.remote;

const RepositoryListItem = tsx.componentFactoryOf<{ onClick: void }>().create({
  name: "RepositoryListItem",
  functional: true,
  props: {
    icon: p(String).required,
    text: p(String).required,
    description: p(String).required
  },
  render(_h, ctx): VNode {
    const { props, listeners } = ctx;
    return (
      <md-list-item {...{ on: listeners }}>
        <md-icon staticClass="md-dense">{props.icon}</md-icon>
        <div staticClass="md-list-item-text">
          <span class={[md.SUBHEADING, style.repoName]}>{props.text}</span>
          <span class={[md.CAPTION, style.repoDescription]}>
            {props.description}
          </span>
        </div>
      </md-list-item>
    );
  }
});

// @vue/component
export default componentWithStore({
  name: "TheWelcomePage",
  components: {
    BaseLayout,
    DrawerNavigation
  },
  computed: {
    recentOpened(): string[] {
      return this.$store.state.environment.recentOpened;
    }
  },
  methods: {
    openRepository(repoPath: string): void {
      navigate.log(repoPath);
    },
    selectRepository(): void {
      const paths = dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
        properties: ["openDirectory"]
      });
      if (typeof paths === "undefined") {
        return;
      }
      const repoPath = normalizePathSeparator(paths[0]);
      navigate.log(repoPath);
    },
    renderListItem(
      key: string,
      icon: string,
      text: string,
      description: string,
      onClick: () => void
    ): VNode {
      return (
        <md-list-item onClick={onClick} key={key}>
          <md-icon staticClass="md-dense">{icon}</md-icon>
          <div staticClass="md-list-item-text">
            <span class={[md.SUBHEADING, style.repoName]}>{text}</span>
            <span class={[md.CAPTION, style.repoDescription]}>
              {description}
            </span>
          </div>
        </md-list-item>
      );
    }
  },
  render(): VNode {
    const { actions } = this.$store;
    return (
      <BaseLayout title="inazuma">
        <template slot="drawer-navigations">
          <DrawerNavigation
            icon="settings"
            text="Preferences"
            onClick={actions.showPreference}
          />
          <DrawerNavigation
            icon="info_outline"
            text="About"
            onClick={actions.showVersionDialog}
          />
        </template>
        <div class={style.content}>
          <h3 class={md.TITLE}>SELECT REPOSITORY</h3>
          <div class={style.leftPanel}>
            <md-list staticClass="md-double-line">
              <RepositoryListItem
                key=":browser"
                icon="search"
                text="BROWSE..."
                description="Select repositories by folder browser"
                onClick={this.selectRepository}
              />
              <md-divider class={style.divider} />
              <md-subheader class={[md.PRIMARY, md.CAPTION]}>
                Recent opened
              </md-subheader>
              {this.recentOpened.map(repo => (
                <RepositoryListItem
                  key={repo}
                  icon="history"
                  text={getFileName(repo)}
                  description={repo}
                  onClick={() => this.openRepository(repo)}
                />
              ))}
            </md-list>
          </div>
        </div>
      </BaseLayout>
    );
  }
});