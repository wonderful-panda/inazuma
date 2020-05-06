import * as vca from "vue-tsx-support/lib/vca";
import { ErrorLikeObject } from "view/mainTypes";
import VIconButton from "./VIconButton";
import * as md from "view/utils/md-classes";
import { MdSnackbar, MdIcon } from "./md";
import { css } from "emotion";
import { __sync } from "view/utils/modifiers";
import { computed } from "@vue/composition-api";
import { optional, required } from "./prop";

export default vca.component({
  name: "VErrorReporter",
  props: {
    error: optional<ErrorLikeObject>(),
    hide: required(Function)
  },
  setup(p) {
    const hasError = computed({
      get: () => !!p.error,
      set: v => v || p.hide()
    });
    return () => {
      return (
        <MdSnackbar class={style.container} md-active={__sync(hasError.value)}>
          <div>
            <MdIcon>warning</MdIcon>
            <span class={[md.BODY1, style.message]}>{p.error?.message}</span>
          </div>
          <VIconButton action={p.hide}>close</VIconButton>
        </MdSnackbar>
      );
    };
  }
});

const style = {
  container: css`
    max-width: 80%;
    padding: 12px;
    background-color: var(--md-theme-default-accent) !important;
    .md-snackbar-content,
    .md-icon {
      color: var(--md-theme-default-text-primary-on-accent) !important;
    }
  `,
  message: css`
    margin-left: 8px;
    font-weight: bold;
  `
};
