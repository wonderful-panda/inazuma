import * as vca from "vue-tsx-support/lib/vca";
import VIconButton from "./VIconButton";
import p from "vue-strict-prop";
import * as md from "view/utils/md-classes";
import { MdSnackbar, MdIcon } from "./md";
import * as emotion from "emotion";
import { __sync } from "view/utils/modifiers";
import { computed } from "@vue/composition-api";
const css = emotion.css;

export default vca.component({
  name: "VNotification",
  props: {
    message: p(String).required,
    icon: p(String).required,
    color: p.ofStringLiterals("primary", "accent").required,
    hide: p.ofFunction<() => void>().required
  },
  setup(p) {
    const hasMessage = computed({
      get: () => !!p.message,
      set: v => v || p.hide()
    });
    return () => (
      <MdSnackbar
        class={style.container(p.color)}
        md-active={__sync(hasMessage.value)}
      >
        <div>
          <MdIcon>{p.icon}</MdIcon>
          <span class={[md.BODY1, style.message]}>{p.message}</span>
        </div>
        <VIconButton action={p.hide}>close</VIconButton>
      </MdSnackbar>
    );
  }
});

const style = {
  container: (color: "primary" | "accent") => css`
    max-width: 80%;
    padding: 12px;
    background-color: var(${"--md-theme-default-" + color}) !important;
    .md-snackbar-content,
    .md-icon {
      color: var(${"--md-theme-default-text-primary-on-" + color}) !important;
    }
  `,
  message: css`
    margin-left: 8px;
    font-weight: bold;
  `
};
