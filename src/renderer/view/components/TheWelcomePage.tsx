import Electron from "electron";
import * as vca from "vue-tsx-support/lib/vca";
import BaseLayout from "./BaseLayout";
import VBackdropSpinner from "./base/VBackdropSpinner";
import DrawerNavigation from "./DrawerNavigation";
import { getFileName, normalizePathSeparator, omit } from "core/utils";
import * as md from "view/utils/md-classes";
import {
  MdIcon,
  MdDoubleLineList,
  MdSubheader,
  MdDivider,
  MdListItem,
  MdListItemText
} from "./base/md";
import { css } from "@emotion/css";
import VIconButton from "./base/VIconButton";
import { useRootModule } from "view/store";
import { provideStorageWithAdditionalNamespace } from "./injection/storage";
import { ref } from "@vue/composition-api";
const { dialog, BrowserWindow } = Electron.remote;

const RepositoryListItem = _fc<{
  icon: string;
  text: string;
  description: string;
  action: () => void;
  remove?: () => void;
}>(({ props, data: { scopedSlots, attrs, ...rest } }) => {
  return (
    <MdListItem
      onClick={props.action}
      {...rest}
      attrs={omit(attrs, Object.keys(props))}
    >
      <MdIcon>{props.icon}</MdIcon>
      <MdListItemText>
        <span class={[md.SUBHEADING, style.repoName]}>{props.text}</span>
        <span class={[md.CAPTION, style.repoDescription]}>
          {props.description}
        </span>
      </MdListItemText>
      {props.remove ? (
        <VIconButton staticClass="md-list-action" mini action={props.remove}>
          close
        </VIconButton>
      ) : (
        undefined
      )}
    </MdListItem>
  );
});

export default vca.component({
  name: "TheWelcomePage",
  components: {
    BaseLayout,
    DrawerNavigation
  },
  setup() {
    provideStorageWithAdditionalNamespace("welcome");
    const rootModule = useRootModule();
    const loading = ref(false);

    const openRepository = async (repoPath: string) => {
      loading.value = true;
      try {
        await rootModule.actions.openRepository({ repoPath });
      } finally {
        loading.value = false;
      }
    };

    const selectRepository = async (): Promise<void> => {
      const parent = BrowserWindow.getFocusedWindow();
      const options: Electron.OpenDialogOptions = {
        properties: ["openDirectory"]
      };
      const result = await (parent
        ? dialog.showOpenDialog(parent, options)
        : dialog.showOpenDialog(options));
      if (result.canceled || !result.filePaths) {
        return;
      }
      const repoPath = normalizePathSeparator(result.filePaths[0]);
      openRepository(repoPath);
    };

    return () => {
      const { actions, getters } = rootModule;
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
          {loading.value && <VBackdropSpinner />}
          <div class={style.content}>
            <h3 class={md.TITLE}>SELECT REPOSITORY</h3>
            <div class={style.leftPanel}>
              <MdDoubleLineList>
                <RepositoryListItem
                  key=":browser"
                  icon="search"
                  text="BROWSE..."
                  description="Select repositories by folder browser"
                  action={selectRepository}
                />
                <MdDivider class={style.divider} />
                <MdSubheader class={[md.PRIMARY, md.CAPTION]}>
                  Recent opened
                </MdSubheader>
                <transition-group name="recents">
                  {getters.visibleRecentList.map(repoPath => (
                    <RepositoryListItem
                      key={repoPath}
                      icon="history"
                      text={getFileName(repoPath)}
                      description={repoPath}
                      action={() => openRepository(repoPath)}
                      remove={() => actions.removeRecentList({ repoPath })}
                    />
                  ))}
                </transition-group>
              </MdDoubleLineList>
            </div>
          </div>
        </BaseLayout>
      );
    };
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

      .recents-move {
        transition: transform 0.3s;
      }
      .recents-leave-active {
        position: absolute;
      }
    }
    .md-list-item-content {
      min-height: 32px !important;
      :hover .md-list-action {
        opacity: 1;
      }
    }
    .md-subheader {
      min-height: 32px !important;
    }
    .md-icon {
      margin-right: 0 !important;
    }
    .md-list-action {
      opacity: 0;
    }
  `,
  repoName: css`
    height: 20px;
    margin-left: 16px;
    margin-right: auto;
    text-transform: none !important;
  `,
  repoDescription: css`
    margin-left: 16px;
    text-transform: none !important;
    font-size: 75%;
  `,
  divider: css`
    margin: 0.5em 0 !important;
  `
};
