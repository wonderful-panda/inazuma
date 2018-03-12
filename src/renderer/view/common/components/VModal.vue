<script lang="tsx">
import Vue, { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { queryFocusableElements } from "view/common/domutils";
import VCloseButton from "./VCloseButton.vue";
import * as md from "view/common/md-classes";
import { __capture } from "view/common/modifiers";

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
      const s = this.$style;
      return (
        <transition name="modal">
          <div
            class={["fullscreen-overlay", s.mask]}
            onClick={this.cancel}
            onKeydown={__capture(m.tab(this.onTabKeyDown))}
          >
            <div
              class={[s.container, this.containerClass]}
              onClick={m.stop}
              onKeydown={m.esc(this.cancel)}
            >
              <div staticClass={s.header}>
                <div class={[s.title, md.TITLE]}>{this.title}</div>
                <VCloseButton onClick={this.cancel} />
              </div>
              <div staticClass={s.content}>{this.$slots.default}</div>
              <div staticClass={s.footer}>
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
</script>

<style lang="scss" module>
.mask {
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  transition: all 0.3s ease;
  overflow: hidden;
}

.mask:global(.modal-enter),
.mask:global(.modal-leave-active) {
  background-color: rgba(0, 0, 0, 0);
}

.container {
  display: flex;
  padding-left: 1em;
  flex-flow: column nowrap;
  box-sizing: border-box;
  background: var(--md-theme-default-background);
}

.title {
  margin-top: 1em;
  margin-bottom: 0.5em;
  flex: 1;
}

.header {
  display: flex;
  flex-flow: row nowrap;
}

.footer {
  display: flex;
  flex-direction: row;
  padding-right: 1em;
}

.content {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: auto;
}
</style>
