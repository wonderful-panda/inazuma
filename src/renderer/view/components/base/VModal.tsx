import Vue, { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { queryFocusableElements } from "view/utils/dom";
import VCloseButton from "./VCloseButton";
import * as md from "view/utils/md-classes";
import { __capture } from "view/utils/modifiers";
import * as emotion from "emotion";
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

// @vue/component
export default tsx.component({
  name: "VModal",
  props: {
    title: p(String).required,
    close: p.ofFunction<() => void>().required
  },
  mounted() {
    Vue.nextTick(() => {
      const focusable = queryFocusableElements(this.$el as HTMLElement);
      if (focusable) {
        focusable[0].focus();
      }
    });
  },
  methods: {
    cancel(): void {
      this.close();
    },
    onTabKeyDown(event: KeyboardEvent): void {
      const focusable = queryFocusableElements(this.$el as HTMLElement);
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
    }
  },
  render(): VNode {
    return (
      <transition name="modal">
        <div
          class={["fullscreen-overlay", style.mask]}
          onClick={this.cancel}
          onKeydown={__capture(m.tab(this.onTabKeyDown))}
        >
          <div
            class={ModalContainerClass}
            onClick={m.stop}
            onKeydown={m.esc(this.cancel)}
          >
            <div staticClass={style.header}>
              <div class={[style.title, md.TITLE]}>{this.title}</div>
              <VCloseButton action={this.cancel} />
            </div>
            <div staticClass={style.content}>{this.$slots.default}</div>
            <div staticClass={style.footer}>
              <div staticClass="flex--expand" />
              {this.$slots["footer-buttons"]}
            </div>
          </div>
        </div>
      </transition>
    );
  }
});
