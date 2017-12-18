<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";

// @vue/component
export default tsx.componentFactoryOf<{ onClick: null }>().create({
  name: "VButton",
  props: {
    href: p(String).optional,
    tooltip: p(String).optional,
    mini: p(Boolean).default(false),
    raised: p(Boolean).default(false),
    disabled: p(Boolean).default(false),
    primary: p(Boolean).default(false),
    accent: p(Boolean).default(false)
  },
  computed: {
    classes(): object {
      return {
        "md-mini": this.mini,
        "md-raised": this.raised,
        "md-primary": this.primary,
        "md-accent": this.accent
      };
    }
  },
  methods: {
    onClick(event: Event) {
      this.$emit("click", null);
      event.stopPropagation();
    }
  },
  render(): VNode {
    const tooltip = this.tooltip ? (
      <md-tooltip>{this.tooltip}</md-tooltip>
    ) : (
      undefined
    );
    return (
      <md-button
        class={this.classes}
        href={this.href}
        disabled={this.disabled}
        onClick={this.onClick}
      >
        {this.$slots.default}
        {tooltip}
      </md-button>
    );
  }
});
</script>
