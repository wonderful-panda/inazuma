import Vue, { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { queryFocusableElements } from "view/utils/dom";
import VCloseButton from "./VCloseButton";
import * as md from "view/utils/md-classes";
import { __capture } from "view/utils/modifiers";
import * as style from "./VModal.scss";

const m = tsx.modifiers;

export default tsx.componentFactoryOf<{ onClose: null }>().create(
  // @vue/component
  {
    name: "VModal",
    props: {
      title: p(String).required,
      containerClass: p(String).optional
    },
    mounted() {
      Vue.nextTick(() => {
        const focusable = queryFocusableElements(this.$el);
        if (focusable) {
          focusable[0].focus();
        }
      });
    },
    methods: {
      cancel(): void {
        this.$emit("close", null);
      },
      onTabKeyDown(event: KeyboardEvent): void {
        const focusable = queryFocusableElements(this.$el);
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
              class={[style.container, this.containerClass]}
              onClick={m.stop}
              onKeydown={m.esc(this.cancel)}
            >
              <div staticClass={style.header}>
                <div class={[style.title, md.TITLE]}>{this.title}</div>
                <VCloseButton onClick={this.cancel} />
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
  },
  ["title"]
);
