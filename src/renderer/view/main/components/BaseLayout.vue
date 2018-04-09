<script lang="tsx">
import { VNode } from "vue";
import { componentWithStore } from "../store";
import p from "vue-strict-prop";
import VDialogBase from "view/common/components/VDialogBase.vue";
import VIconButton from "view/common/components/VIconButton.vue";
import VErrorReporter from "view/common/components/VErrorReporter.vue";
import * as md from "view/common/md-classes";
import { __capture } from "view/common/modifiers";

// @vue/component
export default componentWithStore({
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
    const { state, actions } = this.$store;
    return (
      <div staticClass={this.$style.container}>
        <md-app md-mode="fixed">
          <md-app-toolbar staticClass="md-primary" md-dense>
            <VIconButton mini onClick={this.toggleMenu}>
              menu
            </VIconButton>
            <span
              class={[this.$style.title, md.TITLE]}
              style={{ margin: 0, flex: 1 }}
            >
              {this.title}
            </span>
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
            <div staticClass={this.$style.content}>
              {this.$slots["default"]}
            </div>
          </md-app-content>
        </md-app>

        <router-view />
        <VErrorReporter
          error={state.errorReporter.error}
          hide={actions.errorReporter.clear}
        />
        <VDialogBase state={state.dialog} actions={actions.dialog} />
      </div>
    );
  }
});
</script>

<style lang="scss" module>
.container {
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

.main-title {
  margin: 0;
}

.content {
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
</style>
