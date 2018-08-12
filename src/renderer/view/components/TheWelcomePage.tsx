import { VNode } from "vue";
import Electron from "electron";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { storeComponent } from "../store";
import BaseLayout from "./BaseLayout";
import DrawerNavigation from "./DrawerNavigation";
import { getFileName, normalizePathSeparator } from "core/utils";
import { navigate } from "../route";
import * as md from "view/utils/md-classes";
import {
  MdIcon,
  MdDoubleLineList,
  MdSubheader,
  MdDivider,
  MdListItem,
  MdListItemText
} from "./base/md";
const { dialog, BrowserWindow } = Electron.remote;
import * as emotion from "emotion";
const css = emotion.css;

const RepositoryListItem = tsx.component({
  name: "RepositoryListItem",
  functional: true,
  props: {
    icon: p(String).required,
    text: p(String).required,
    description: p(String).required,
    action: p.ofFunction<() => void>().required
  },
  render(_h, ctx): VNode {
    const { props } = ctx;
    return (
      <MdListItem onClick={props.action}>
        <MdIcon>{props.icon}</MdIcon>
        <MdListItemText>
          <span class={[md.SUBHEADING, style.repoName]}>{props.text}</span>
          <span class={[md.CAPTION, style.repoDescription]}>
            {props.description}
          </span>
        </MdListItemText>
      </MdListItem>
    );
  }
});

// @vue/component
export default storeComponent.create({
  name: "TheWelcomePage",
  components: {
    BaseLayout,
    DrawerNavigation
  },
  computed: {
    recentOpened(): string[] {
      return this.state.environment.recentOpened;
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
    }
  },
  render(): VNode {
    const { actions } = this;
    return (
      <BaseLayout title="inazuma">
        <template slot="drawer-navigations">
          <DrawerNavigation
            icon="settings"
            text="Preferences"
            action={actions.showPreference}
          />
          <DrawerNavigation
            icon="info_outline"
            text="About"
            action={actions.showVersionDialog}
          />
        </template>
        <div class={style.content}>
          <h3 class={md.TITLE}>SELECT REPOSITORY</h3>
          <div class={style.leftPanel}>
            <MdDoubleLineList>
              <RepositoryListItem
                key=":browser"
                icon="search"
                text="BROWSE..."
                description="Select repositories by folder browser"
                action={this.selectRepository}
              />
              <MdDivider class={style.divider} />
              <MdSubheader class={[md.PRIMARY, md.CAPTION]}>
                Recent opened
              </MdSubheader>
              {this.recentOpened.map(repo => (
                <RepositoryListItem
                  key={repo}
                  icon="history"
                  text={getFileName(repo)}
                  description={repo}
                  action={() => this.openRepository(repo)}
                />
              ))}
            </MdDoubleLineList>
          </div>
        </div>
      </BaseLayout>
    );
  }
});

const style = {
  content: css`
    flex: 1;
    padding: 0 1em;
  `,
  leftPanel: css`
    display: inline-block;
    min-width: 40%;

    .md-list {
      background-color: var(--md-theme-default-background-on-background);
      padding: 0 0.5em;
    }
    .md-list-item-content {
      min-height: 32px !important;
    }
    .md-subheader {
      min-height: 32px !important;
    }
    .md-icon {
      margin-right: 0.5em !important;
    }
  `,
  repoName: css`
    height: 20px;
    margin-right: auto;
    text-transform: none !important;
  `,
  repoDescription: css`
    text-transform: none !important;
    font-size: 75%;
  `,
  divider: css`
    margin: 0.5em 0 !important;
  `
};
