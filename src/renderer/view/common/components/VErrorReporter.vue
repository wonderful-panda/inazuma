<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { ErrorLikeObject } from "../storeModules/errorReporter";
import p from "vue-strict-prop";
import * as md from "../md-classes";

export default tsx.component(
  {
    name: "VErrorReporter",
    props: {
      error: p.ofObject<ErrorLikeObject>().optional,
      hide: p(Function).required
    },
    watch: {
      error(value: ErrorLikeObject | undefined) {
        if (value) {
          console.log(JSON.stringify(value, null, 2));
          setTimeout(() => {
            if (value === this.error) {
              this.hide();
            }
          }, 4000);
        }
      }
    },
    computed: {
      message(): string {
        return this.error ? this.error.message : "";
      }
    },
    render(): VNode {
      const s = this.$style;
      return (
        <div class={s.container}>
          <transition name={s.transition}>
            <md-content v-show={this.error} class={s.content}>
              <span class={md.SUBHEADING}>{this.message}</span>
            </md-content>
          </transition>
        </div>
      );
    }
  },
  ["hide"]
);
</script>

<style lang="scss" module>
.container {
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  max-height: 48px;
  width: 80%;
  margin: 0 auto;
  overflow: hidden;
}

.content {
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
  width: 100%;
  padding: 1em;
  background-color: #444 !important;
}

.transition {
  &:global(-enter-active),
  &:global(-leave-active) {
    transition: all 0.3s ease;
  }

  &:global(-enter),
  &:global(-leave-to) {
    transform: translateY(100%);
  }
}
</style>
