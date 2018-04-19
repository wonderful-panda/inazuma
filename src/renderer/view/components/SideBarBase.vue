<script lang="tsx">
import { VNode } from "vue";
import { componentWithStore } from "../store";
import p from "vue-strict-prop";
import VCloseButton from "./base/VCloseButton.vue";

// @vue/component
export default componentWithStore({
  name: "SideBarBase",
  components: {
    VCloseButton
  },
  props: {
    title: p(String).required
  },
  methods: {
    close() {
      this.$store.actions.hideSidebar();
    }
  },
  render(): VNode {
    const s = this.$style;
    return (
      <transition name="sidebar" mode="out-in">
        <div staticClass={s.wrapper}>
          <div staticClass={s.container}>
            <div staticClass={s.titlebar}>
              <span staticClass={s.title}>{this.title}</span>
              <VCloseButton onClick={this.close} />
            </div>
            <div staticClass={s.content}>{this.$slots.default}</div>
          </div>
        </div>
      </transition>
    );
  }
});
</script>

<style lang="scss" module>
$sidebar-width: 200px;

.wrapper {
  display: flex;
  flex-flow: row-reverse nowrap;
  overflow-x: hidden;
  width: $sidebar-width;
  max-width: $sidebar-width;
  transition: all 0.3s ease;
}

.container {
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  box-sizing: border-box;
  width: $sidebar-width;
  min-width: $sidebar-width;
  max-width: $sidebar-width;
}

.titlebar {
  display: flex;
  flex-flow: row nowrap;
}

.title {
  font-size: large;
  vertical-align: bottom;
  margin: auto;
  padding-top: 0.5em;
  padding-left: 0.5em;
  flex: 1;
}

.content {
  display: flex;
  padding: 0.5em;
  flex: 1;
}

.wrapper:global(.sidebar-enter),
.wrapper:global(.sidebar-leave-to) {
  width: 0;
  max-width: 0;
}
</style>
