import { VNode } from "vue";
import { storeComponent } from "../store";
import p from "vue-strict-prop";
import VDialogBase from "./base/VDialogBase";
import VIconButton from "./base/VIconButton";
import VErrorReporter from "./base/VErrorReporter";
import ThePreferencePage from "./ThePreferencePage";
import * as md from "view/utils/md-classes";
import { __capture } from "view/utils/modifiers";

// @vue/component
export default storeComponent.create({
  name: "BaseLayout",
  props: {
    title: p(String).required
  },
  data() {
    return { menuVisible: false };
  },
  methods: {
    toggleMenu(): void {
      this.menuVisible = !this.menuVisible;
    }
  },
  render(): VNode {
    const drawerEventListener = {
      "update:mdActive": (v: boolean) => {
        this.menuVisible = v;
      }
    };
    const { state, actions } = this;
    return (
      <div staticClass={style.container}>
        <md-app md-mode="fixed">
          <md-app-toolbar staticClass="md-primary" md-dense>
            <VIconButton mini onClick={this.toggleMenu}>
              menu
            </VIconButton>
            <span class={[style.title, md.TITLE]}>{this.title}</span>
            <div staticClass="md-toolbar-section-end">
              {this.$slots["titlebar-buttons"]}
            </div>
          </md-app-toolbar>

          <md-app-drawer
            md-fixed
            md-active={this.menuVisible}
            {...{ on: drawerEventListener }}
          >
            <md-toolbar staticClass="md-transparent" md-elevation={0}>
              <div staticClass="md-toolbar-section-end">
                <VIconButton mini onClick={this.toggleMenu}>
                  keyboard_arrow_left
                </VIconButton>
              </div>
            </md-toolbar>
            <md-list onClick={__capture(this.toggleMenu)}>
              {this.$slots["drawer-navigations"]}
            </md-list>
          </md-app-drawer>

          <md-app-content style={{ position: "relative", padding: "1px" }}>
            <div class={style.content}>{this.$slots["default"]}</div>
          </md-app-content>
        </md-app>

        {state.preferenceShown ? (
          <ThePreferencePage />
        ) : (
          <div style={{ display: "none" }} />
        )}

        <VErrorReporter
          error={state.errorReporter.error}
          hide={actions.errorReporter.clear}
        />
        <VDialogBase state={state.dialog} actions={actions.dialog} />
      </div>
    );
  }
});

const style = css`
  .${"container"} {
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    :global {
      .md-app {
        flex: 1;
      }

      .md-app-toolbar {
        padding: 0 4px;
      }
    }
  }

  .${"title"} {
    margin: 0 !important;
    flex: 1;
  }

  .${"content"} {
    display: flex;
    flex-direction: row;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    box-sizing: border-box;
    padding: 4px;
  }
`;
