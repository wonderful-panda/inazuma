<template lang="pug">
  doctype html
  v-modal(:class="$style.modalBase", title="PREFERENCE", :container-class="$style.container" @close="back")
    form(:class="$style.modalContent", action="#")
      v-text-field(
        label="Path of external diff tool",
        v-model="config.externalDiffTool")

      v-text-field(
        label="Interactive shell command",
        v-model="config.interactiveShell")

      v-text-field(
        :class="$style.numberInput",
        input-id="recentListCount",
        label="Number of recent opened list",
        :input-attrs="{ type: 'number', min: 0, max: 20 }",
        v-model.number="config.recentListCount")

      v-text-field(
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
import VButton from "view/common/components/VButton.vue";
import VModal from "view/common/components/VModal.vue";
import VTextField from "view/common/components/VTextField.vue";

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
      this.$router.back();
    },
    async onOk() {
      await this.$store.actions.resetConfig(this.$data.config);
      this.$router.back();
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

.numberInput {
  min-width: 200px;
  width: 200px;
}
</style>
