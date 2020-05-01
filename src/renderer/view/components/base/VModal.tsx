import * as tsx from "vue-tsx-support";
import * as vca from "vue-tsx-support/lib/vca";
import { queryFocusableElements } from "view/utils/dom";
import VCloseButton from "./VCloseButton";
import * as md from "view/utils/md-classes";
import { __capture } from "view/utils/modifiers";
import * as emotion from "emotion";
import { onMounted, ref } from "@vue/composition-api";
import { required } from "./prop";
const css = emotion.css;

const m = tsx.modifiers;

export const ModalContainerClass = "vmodal-container";

const style = {
  mask: css`
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9998;
    transition: all 0.3s ease;
    overflow: hidden;
    &.modal-enter,
    &.modal-leave-active {
      background-color: rgba(0, 0, 0, 0);
    }
    .${ModalContainerClass} {
      display: flex;
      padding-left: 1em;
      flex-flow: column nowrap;
      box-sizing: border-box;
      background: var(--md-theme-default-background);
    }
  `,
  title: css`
    margin-top: 1em;
    margin-bottom: 0.5em;
    flex: 1;
  `,
  header: css`
    display: flex;
    flex-flow: row nowrap;
  `,
  footer: css`
    display: flex;
    flex-direction: row;
    padding-right: 1em;
  `,
  content: css`
    display: flex;
    flex: 1;
    flex-direction: column;
    overflow: auto;
  `
};

export default vca.component({
  name: "VModal",
  props: {
    title: required(String),
    close: required(Function)
  },
  setup(p, ctx) {
    const root = ref(null as null | HTMLDivElement);

    const onTabKeyDown = (event: KeyboardEvent) => {
      if (!root.value) {
        return;
      }
      const focusable = queryFocusableElements(root.value);
      if (focusable.length === 0) {
        return;
      }
      if (event.shiftKey) {
        if (event.target === focusable[0]) {
          focusable[focusable.length - 1].focus();
          event.preventDefault();
        }
      } else {
        if (event.target === focusable[focusable.length - 1]) {
          focusable[0].focus();
          event.preventDefault();
        }
      }
    };
    onMounted(() => {
      if (!root.value) {
        return;
      }
      const focusable = queryFocusableElements(root.value);
      if (focusable) {
        focusable[0].focus();
      }
    });
    return () => {
      return (
        <transition name="modal">
          <div
            ref={root as any}
            class={["fullscreen-overlay", style.mask]}
            onClick={p.close}
            onKeydown={__capture(m.tab(onTabKeyDown))}
          >
            <div
              class={ModalContainerClass}
              onClick={m.stop}
              onKeydown={m.esc(p.close)}
            >
              <div staticClass={style.header}>
                <div class={[style.title, md.TITLE]}>{p.title}</div>
                <VCloseButton action={p.close} />
              </div>
              <div staticClass={style.content}>{ctx.slots.default()}</div>
              <div staticClass={style.footer}>
                <div staticClass="flex--expand" />
                {ctx.slots["footer-buttons"]()}
              </div>
            </div>
          </div>
        </transition>
      );
    };
  }
});
