<template lang="pug">
  doctype html
  v-modal(:class="$style.modalBase", title="PREFERENCE", :container-class="$style.container" @close="back")
    form(:class="$style.modalContent", action="#")
      md-subheader.md-primary(:class="$style.subHeader") Font settings
      v-text-field(
        :class="$style.input",
        label="Default font",
        v-model="config.fontFamily.standard")

      v-text-field(
        :class="$style.input",
        label="Monospace font",
        v-model="config.fontFamily.monospace")

      md-subheader.md-primary(:class="$style.subHeader") External tools
      v-text-field(
        :class="$style.input",
        label="Path of external diff tool",
        v-model="config.externalDiffTool")

      v-text-field(
        :class="$style.input",
        label="Interactive shell command",
        v-model="config.interactiveShell")

      md-subheader.md-primary(:class="$style.subHeader") Miscellaneous
      v-text-field(
        :class="$style.numberInput",
        input-id="recentListCount",
        label="Number of recent opened list",
        :input-attrs="{ type: 'number', min: 0, max: 20 }",
        v-model.number="config.recentListCount")

      v-text-field(
        :class="$style.input",
        label="Path of vue dev tool",
        v-model="config.vueDevTool")

    template(slot="footer-buttons")
      v-button(primary, mini, @click="onOk")
        span.md-title SAVE
      v-button(mini, @click="back")
        span.md-title CANCEL
</template>

<script lang="ts">
import Vue from "vue";
import { componentWithStore } from "../store";
import VButton from "./base/VButton.vue";
import VModal from "./base/VModal.vue";
import VTextField from "./base/VTextField.vue";

// @vue/component
export default componentWithStore({
  name: "ThePreferencePage",
  components: {
    VButton,
    VModal,
    VTextField
  },
  data() {
    // don't pass state.config directly.
    return {
      config: JSON.parse(JSON.stringify(this.$store.state.config))
    };
  },
  mounted() {
    Vue.nextTick(() => {
      const input = this.$el.querySelector("input") as HTMLInputElement;
      if (input) {
        input.focus();
      }
    });
  },
  methods: {
    back() {
      this.$store.actions.hidePreference();
    },
    async onOk() {
      await this.$store.actions.resetConfig(this.$data.config);
      this.back();
    }
  }
});
</script>

<style lang="scss" module>
.container {
  display: flex;
  position: absolute;
  left: 0;
  top: 0;
  width: 80%;
  height: 100%;
  bottom: 0;
  box-shadow: 4px 0 4px rgba(0, 0, 0, 0.4);

  flex: 1;
  transition: all 0.3s ease;
}

.subHeader {
  padding: 0;
  min-height: 26px;
}

.modalBase:global(.modal-enter),
.modalBase:global(.modal-leave-to) {
  .container {
    transform: translateX(-100%);
  }
}

.modalContent {
  padding-left: 8px;
  padding-right: 32px;
}

.input {
  margin-left: 1em;
}
.numberInput {
  margin-left: 1em;
  min-width: 200px;
  width: 200px;
}
</style>
