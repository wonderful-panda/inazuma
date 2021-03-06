import * as vca from "vue-tsx-support/lib/vca";
import { VIconButton } from "./VIconButton";
import * as md from "view/utils/md-classes";
import { MdSnackbar } from "./md";
import { VMaterialIcon, MaterialIconNames } from "./VMaterialIcon";
import { css } from "@emotion/css";
import { __sync } from "view/utils/modifiers";
import { computed } from "@vue/composition-api";
import { required } from "./prop";

export default vca.component({
  name: "VNotification",
  props: {
    message: required(String),
    icon: required<MaterialIconNames>(String),
    color: required<"primary" | "accent">(String),
    hide: required(Function)
  },
  setup(p) {
    const hasMessage = computed({
      get: () => !!p.message,
      set: (v) => v || p.hide()
    });
    return () => (
      <MdSnackbar class={style.container(p.color)} md-active={__sync(hasMessage.value)}>
        <div>
          <VMaterialIcon name={p.icon} />
          <span class={[md.BODY1, style.message]}>{p.message}</span>
        </div>
        <VIconButton action={p.hide}>
          <VMaterialIcon name="Close" />
        </VIconButton>
      </MdSnackbar>
    );
  }
});

const style = {
  container: (color: "primary" | "accent") => css`
    max-width: 80%;
    padding: 12px;
    background-color: var(${"--md-theme-default-" + color}) !important;
    color: var(${"--md-theme-default-text-primary-on-" + color}) !important;
  `,
  message: css`
    margin-left: 8px;
    font-weight: bold;
  `
};
