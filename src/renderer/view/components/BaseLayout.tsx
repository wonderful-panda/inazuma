import { VNode } from "vue";
import { withStore, rootModule } from "../store";
import p from "vue-strict-prop";
import VDialogBase from "./base/VDialogBase";
import VIconButton from "./base/VIconButton";
import VNotification from "./base/VNotification";
import PreferencePanel from "./PreferencePanel";
import * as md from "view/utils/md-classes";
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
          <md-app-toolbar staticClass="md-primary" md-dense>
            <VIconButton mini action={this.toggleMenu}>
              menu
            </VIconButton>
            <span class={[style.title, md.TITLE]}>{this.title}</span>
            <div staticClass="md-toolbar-section-end">
              {this.$slots["titlebar-buttons"]}
            </div>
          </md-app-toolbar>

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

          <md-app-content style={{ position: "relative", padding: "1px" }}>
            <div class={style.content}>{this.$slots["default"]}</div>
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
  content: css`
    display: flex;
    flex-direction: row;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    box-sizing: border-box;
    padding: 4px;
  `
};
