import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { ErrorLikeObject } from "view/mainTypes";
import VIconButton from "./VIconButton";
import p from "vue-strict-prop";
import * as md from "view/utils/md-classes";
import { MdSnackbar, MdIcon } from "./md";

// @vue/component
export default tsx.component({
  name: "VErrorReporter",
  props: {
    error: p.ofObject<ErrorLikeObject>().optional,
    hide: p.ofFunction<() => void>().required
  },
  computed: {
    message(): string {
      return this.error ? this.error.message : "";
    }
  },
  render(): VNode {
    return (
      <MdSnackbar
        class={style.container}
        md-active={!!this.error}
        {...{ on: { "update:mdActive": this.hide } }}
      >
        <div>
          <MdIcon>warning</MdIcon>
          <span class={[md.BODY1, style.message]}>{this.message}</span>
        </div>
        <VIconButton action={this.hide}>close</VIconButton>
      </MdSnackbar>
    );
  }
});

const style = css`
  .${"container"} {
    max-width: 80%;
    padding: 12px;
    background-color: var(--md-theme-default-accent) !important;
    :global {
      .md-snackbar-content,
      .md-icon {
        color: var(--md-theme-default-text-primary-on-accent) !important;
      }
    }
  }

  .${"message"} {
    margin-left: 8px;
    font-weight: bold;
  }
`;
