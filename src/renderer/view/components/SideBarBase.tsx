import { VNode } from "vue";
import { componentWithStore } from "../store";
import p from "vue-strict-prop";
import VCloseButton from "./base/VCloseButton";
import * as style from "./SideBarBase.scss";

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
    return (
      <transition name="sidebar" mode="out-in">
        <div staticClass={style.wrapper}>
          <div staticClass={style.container}>
            <div staticClass={style.titlebar}>
              <span staticClass={style.title}>{this.title}</span>
              <VCloseButton onClick={this.close} />
            </div>
            <div staticClass={style.content}>{this.$slots.default}</div>
          </div>
        </div>
      </transition>
    );
  }
});
