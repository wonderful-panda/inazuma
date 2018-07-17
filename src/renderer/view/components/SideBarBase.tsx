import { VNode } from "vue";
import { storeComponent } from "../store";
import p from "vue-strict-prop";
import VCloseButton from "./base/VCloseButton";

// @vue/component
export default storeComponent.create({
  name: "SideBarBase",
  components: {
    VCloseButton
  },
  props: {
    title: p(String).required
  },
  methods: {
    close() {
      this.actions.hideSidebar();
    }
  },
  render(): VNode {
    return (
      <transition name="sidebar" mode="out-in">
        <div staticClass={style.wrapper}>
          <div staticClass={style.container}>
            <div staticClass={style.titlebar}>
              <span staticClass={style.title}>{this.title}</span>
              <VCloseButton action={this.close} />
            </div>
            <div staticClass={style.content}>{this.$slots.default}</div>
          </div>
        </div>
      </transition>
    );
  }
});

const style = css`
  $sidebar-width: 200px;

  .${"wrapper"} {
    display: flex;
    flex-flow: row-reverse nowrap;
    overflow-x: hidden;
    width: $sidebar-width;
    max-width: $sidebar-width;
    transition: all 0.3s ease;

    &:global(.sidebar-enter),
    &:global(.sidebar-leave-to) {
      width: 0;
      max-width: 0;
    }
  }
  .${"container"} {
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    box-sizing: border-box;
    width: $sidebar-width;
    min-width: $sidebar-width;
    max-width: $sidebar-width;
  }
  .${"titlebar"} {
    display: flex;
    flex-flow: row nowrap;
  }
  .${"title"} {
    font-size: large;
    vertical-align: bottom;
    margin: auto;
    padding-top: 0.5em;
    padding-left: 0.5em;
    flex: 1;
  }
  .${"content"} {
    display: flex;
    padding: 0.5em;
    flex: 1;
  }
`;
