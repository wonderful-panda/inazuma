import {
  useErrorReporterModule,
  useDialogModule,
  useRootModule
} from "../store";
import * as vca from "vue-tsx-support/lib/vca";
import p from "vue-strict-prop";
import VDialogBase from "./base/VDialogBase";
import VIconButton from "./base/VIconButton";
import TitleBarButton from "./TitleBarButton";
import VNotification from "./base/VNotification";
import PreferencePanel from "./PreferencePanel";
import { __capture, __sync } from "view/utils/modifiers";
import { MdList } from "./base/md";
import * as emotion from "emotion";
import { ref, computed } from "@vue/composition-api";
import { evaluateSlot } from "core/utils";
const css = emotion.css;

export default vca.component({
  name: "BaseLayout",
  props: {
    title: p(String).required
  },
  setup(p, ctx) {
    const rootModule = useRootModule();
    const errorReporterModule = useErrorReporterModule();
    const dialogModule = useDialogModule();
    const menuVisible = ref(false);
    const dialogState = computed(() => ({ ...dialogModule.state }));
    const toggleMenu = () => {
      menuVisible.value = !menuVisible.value;
    };
    return () => {
      return (
        <div staticClass={style.container}>
          <md-app md-mode="fixed">
            <md-app-drawer md-fixed md-active={__sync(menuVisible.value)}>
              <md-toolbar staticClass="md-transparent" md-elevation={0}>
                <div staticClass="md-toolbar-section-end">
                  <VIconButton mini action={toggleMenu}>
                    keyboard_arrow_left
                  </VIconButton>
                </div>
              </md-toolbar>
              <MdList nativeOn-click={__capture(toggleMenu)}>
                {evaluateSlot(ctx, "drawer-navigations")}
              </MdList>
            </md-app-drawer>

            <md-app-content staticClass={style.contentWrapper}>
              <div staticClass={style.titleBar}>
                <TitleBarButton action={toggleMenu}>menu</TitleBarButton>
                <span style="flex: 1">{p.title}</span>
                {evaluateSlot(ctx, "titlebar-buttons")}
              </div>
              <div staticClass={style.content}>
                {evaluateSlot(ctx, "default")}
              </div>
            </md-app-content>
          </md-app>

          <PreferencePanel
            active={rootModule.state.preferenceShown}
            initialConfig={rootModule.state.config}
            hide={rootModule.actions.hidePreference}
            save={rootModule.actions.resetConfig}
          />
          <VNotification
            icon="info"
            message={rootModule.state.notification}
            color="primary"
            hide={rootModule.actions.hideNotification}
          />
          <VNotification
            icon="warning"
            message={errorReporterModule.getters.message}
            color="accent"
            hide={errorReporterModule.actions.clear}
          />
          <VDialogBase
            state={dialogState.value}
            accept={dialogModule.actions.accept}
            cancel={dialogModule.actions.cancel}
          />
        </div>
      );
    };
  }
});

const style = {
  container: css`
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    .md-app {
      flex: 1;
    }
    .md-app-toolbar {
      padding: 0 4px;
    }
  `,
  title: css`
    margin: 0 !important;
    flex: 1;
  `,
  contentWrapper: css`
    position: relative;
    padding: 1px;
  `,
  titleBar: css`
    position: absolute;
    display: flex;
    flex-flow: row nowrap;
    left: 0;
    top: 0;
    right: 0;
    height: 28px;
    line-height: 28px;
    background-color: #2a2a2a;
    color: #888;
    font-size: 18px !important;
  `,
  content: css`
    display: flex;
    flex-direction: row;
    position: absolute;
    left: 0;
    right: 0;
    top: 28px;
    bottom: 0;
    box-sizing: border-box;
    padding: 4px;
  `
};
