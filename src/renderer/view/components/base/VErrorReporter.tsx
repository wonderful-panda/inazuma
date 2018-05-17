import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { ErrorLikeObject } from "view/mainTypes";
import VIconButton from "./VIconButton";
import p from "vue-strict-prop";
import * as md from "view/utils/md-classes";
import * as style from "./VErrorReporter.scss";

export default tsx.component(
  {
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
        <md-snackbar
          class={style.container}
          md-active={!!this.error}
          {...{ on: { "update:mdActive": this.hide } }}
        >
          <div>
            <md-icon>warning</md-icon>
            <span class={[md.BODY1, style.message]}>{this.message}</span>
          </div>
          <VIconButton onClick={this.hide}>close</VIconButton>
        </md-snackbar>
      );
    }
  },
  ["hide"]
);
