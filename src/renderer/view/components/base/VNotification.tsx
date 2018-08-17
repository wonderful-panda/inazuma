import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import VIconButton from "./VIconButton";
import p from "vue-strict-prop";
import * as md from "view/utils/md-classes";
import { MdSnackbar, MdIcon } from "./md";
import * as emotion from "emotion";
const css = emotion.css;

// @vue/component
export default tsx.component({
  name: "VNotification",
  props: {
    message: p(String).required,
    icon: p(String).required,
    color: p.ofStringLiterals("primary", "accent").required,
    hide: p.ofFunction<() => void>().required
  },
  render(): VNode {
    return (
      <MdSnackbar
        class={style.container(this.color)}
        md-active={!!this.message}
        {...{ on: { "update:mdActive": this.hide } }}
      >
        <div>
          <MdIcon>{this.icon}</MdIcon>
          <span class={[md.BODY1, style.message]}>{this.message}</span>
        </div>
        <VIconButton action={this.hide}>close</VIconButton>
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
