import * as vca from "vue-tsx-support/lib/vca";
import VCloseButton from "./base/VCloseButton";
import { css } from "emotion";
import { evaluateSlot } from "core/utils";
import { required } from "./base/prop";

export default vca.component({
  name: "SideBarBase",
  props: {
    title: required(String),
    hide: required(Function)
  },
  setup(p, ctx) {
    return () => (
      <transition name="sidebar" mode="out-in">
        <div staticClass={style.wrapper}>
          <div staticClass={style.container}>
            <div staticClass={style.titlebar}>
              <span staticClass={style.title}>{p.title}</span>
              <VCloseButton action={p.hide} />
            </div>
            <div staticClass={style.content}>
              {evaluateSlot(ctx, "default")}
            </div>
          </div>
        </div>
      </transition>
    );
  }
});

const SidebarWidth = "200px";
const style = {
  wrapper: css`
    display: flex;
    flex-flow: row-reverse nowrap;
    overflow-x: hidden;
    width: ${SidebarWidth};
    max-width: ${SidebarWidth};
    transition: all 0.3s ease;

    &.sidebar-enter,
    &.sidebar-leave-to {
      width: 0;
      max-width: 0;
    }
  `,
  container: css`
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    box-sizing: border-box;
    width: ${SidebarWidth};
    max-width: ${SidebarWidth};
    min-width: ${SidebarWidth};
  `,
  titlebar: css`
    display: flex;
    flex-flow: row nowrap;
  `,
  title: css`
    font-size: large;
    vertical-align: bottom;
    margin: auto;
    padding-top: 0.5em;
    padding-left: 0.5em;
    flex: 1;
  `,
  content: css`
    display: flex;
    padding: 0.5em;
    flex: 1;
  `
};
