<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { ErrorLikeObject } from "../storeModules/errorReporter";
import VIconButton from "./VIconButton.vue";
import p from "vue-strict-prop";
import * as md from "../md-classes";

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
      const s = this.$style;
      return (
        <md-snackbar
          class={s.container}
          md-active={!!this.error}
          {...{ on: { "update:mdActive": this.hide } }}
        >
          <div>
            <md-icon>warning</md-icon>
            <span class={[md.BODY1, s.message]}>{this.message}</span>
          </div>
          <VIconButton onClick={this.hide}>close</VIconButton>
        </md-snackbar>
      );
    }
  },
  ["hide"]
);
</script>

<style lang="scss" module>
.container {
  max-width: 80%;
  padding: 12px;
  background-color: var(--md-theme-default-accent) !important;
  & * {
    color: var(--md-theme-default-text-primary-on-accent) !important;
  }
}

.message {
  margin-left: 8px;
  font-weight: bold;
}
</style>
