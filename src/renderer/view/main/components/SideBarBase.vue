<template lang="pug">
  transition(name="sidebar", mode="out-in")
    div.sidebar-wrapper
      div.sidebar-container
        div.sidebar-titlebar
          span.sidebar-title {{ title }}
          v-close-button(@click="close")
        div.sidebar-content
          slot
</template>

<script lang="ts">
import { componentWithStore } from "../store";
import p from "vue-strict-prop";
import VCloseButton from "view/common/components/VCloseButton.vue";

// @vue/component
export default componentWithStore({
  name: "SideBarBase",
  components: {
    VCloseButton
  },
  props: {
    title: p(String).required
  },
  methods: {
    close() {
      this.$store.actions.hideSidebar();
    }
  }
});
</script>

<style lang="scss">
$sidebar-width: 200px;

.sidebar-wrapper {
  display: flex;
  flex-flow: row-reverse nowrap;
  overflow-x: hidden;
  width: $sidebar-width;
  max-width: $sidebar-width;
  transition: all 0.2s ease;
}

.sidebar-container {
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  box-sizing: border-box;
  width: $sidebar-width;
  min-width: $sidebar-width;
  max-width: $sidebar-width;
}

.sidebar-titlebar {
  display: flex;
  flex-flow: row nowrap;
}

.sidebar-title {
  font-size: large;
  vertical-align: bottom;
  margin: auto;
  padding-top: 0.5em;
  padding-left: 0.5em;
  flex: 1;
}

.sidebar-content {
  display: flex;
  padding: 0.5em;
  flex: 1;
}

.sidebar-enter,
.sidebar-leave-active {
  width: 0;
  max-width: 0;
}
</style>
