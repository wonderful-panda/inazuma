import { VNode } from "vue";
import { withStore, rootModule } from "../store";
import p from "vue-strict-prop";
import VDialogBase from "./base/VDialogBase";
import VIconButton from "./base/VIconButton";
import TitleBarButton from "./TitleBarButton";
import VNotification from "./base/VNotification";
import PreferencePanel from "./PreferencePanel";
import { __capture, __sync } from "view/utils/modifiers";
import { MdList } from "./base/md";
import * as emotion from "emotion";
import { errorReporterModule } from "view/store/errorReporterModule";
import { dialogModule } from "view/store/dialogModule";
const css = emotion.css;

// @vue/component
export default withStore.create({
  name: "BaseLayout",
  props: {
    title: p(String).required
  },
  data() {
    return { menuVisible: false };
  },
  computed: {
    ...errorReporterModule.mapGetters({ errorMessage: "message" })
  },
  methods: {
    ...rootModule.mapActions([
      "hideNotification",
      "hidePreference",
      "resetConfig"
    ]),
    ...errorReporterModule.mapActions({ clearError: "clear" }),
    ...dialogModule.mapActions({
      acceptDialog: "accept",
      cancelDialog: "cancel"
    }),
    toggleMenu(): void {
      this.menuVisible = !this.menuVisible;
    }
  },
  render(): VNode {
    const state = this.state;
    return (
      <div staticClass={style.container}>
        <md-app md-mode="fixed">
          <md-app-drawer md-fixed md-active={__sync(this.menuVisible)}>
            <md-toolbar staticClass="md-transparent" md-elevation={0}>
              <div staticClass="md-toolbar-section-end">
                <VIconButton mini action={this.toggleMenu}>
                  keyboard_arrow_left
                </VIconButton>
              </div>
            </md-toolbar>
            <MdList nativeOn-click={__capture(this.toggleMenu)}>
              {this.$slots["drawer-navigations"]}
            </MdList>
          </md-app-drawer>

          <md-app-content staticClass={style.contentWrapper}>
            <div staticClass={style.titleBar}>
              <TitleBarButton action={this.toggleMenu}>menu</TitleBarButton>
              <span style="flex: 1">{this.title}</span>
              {this.$slots["titlebar-buttons"]}
            </div>
            <div staticClass={style.content}>{this.$slots["default"]}</div>
          </md-app-content>
        </md-app>

        <PreferencePanel
          active={state.preferenceShown}
          initialConfig={state.config}
          hide={this.hidePreference}
          save={this.resetConfig}
        />
        <VNotification
          icon="info"
          message={state.notification}
          color="primary"
          hide={this.hideNotification}
        />
        <VNotification
          icon="warning"
          message={this.errorMessage}
          color="accent"
          hide={this.clearError}
        />
        <VDialogBase
          state={state.dialog}
          accept={this.acceptDialog}
          cancel={this.cancelDialog}
        />
      </div>
    );
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
