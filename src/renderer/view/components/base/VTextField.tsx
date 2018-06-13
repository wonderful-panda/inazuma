import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";

// @vue/component
export default tsx.component({
  name: "VTextField",
  props: {
    value: p(String, Number).optional,
    label: p(String).optional,
    helperText: p(String).optional,
    disabled: p(Boolean).default(false),
    placeholder: p(String).optional,
    headIcon: p(String).optional,
    inlineIcon: p(String).optional,
    tooltip: p(String).optional,
    inputAttrs: p(Object).optional
  },
  computed: {},
  methods: {
    labelNode(name: string | undefined): VNode | undefined {
      return name ? <label>{name}</label> : undefined;
    },
    helperTextNode(name: string | undefined): VNode | undefined {
      return name ? (
        <span staticClass="md-helper-text">{name}</span>
      ) : (
        undefined
      );
    },
    iconNode(name: string | undefined): VNode | undefined {
      return name ? <md-icon>{name}</md-icon> : undefined;
    },
    tooltipNode(text: string | undefined): VNode | undefined {
      return text ? <md-tooltip>{text}</md-tooltip> : undefined;
    },
    onInput(value: string | undefined) {
      if (this.inputAttrs && this.inputAttrs.type === "number") {
        this.$emit("update:value", (this as any)._n(value));
      } else {
        this.$emit("update:value", value);
      }
    }
  },
  render(): VNode {
    return (
      <md-field>
        {this.iconNode(this.headIcon)}
        {this.labelNode(this.label)}
        <md-input
          placeholder={this.placeholder}
          value={this.value}
          onInput={this.onInput}
          disabled={this.disabled}
          {...{ attrs: this.inputAttrs }}
        />
        {this.helperTextNode(this.helperText)}
        {this.iconNode(this.inlineIcon)}
        {this.tooltipNode(this.tooltip)}
      </md-field>
    );
  }
});
