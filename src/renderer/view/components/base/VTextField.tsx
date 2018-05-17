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
    inputAttrs: p(Object).optional
  },
  computed: {
    labelNode(): VNode | undefined {
      return this.label ? <label>{this.label}</label> : undefined;
    },
    helperTextNode(): VNode | undefined {
      return this.helperText ? (
        <span staticClass="md-helper-text">{this.helperText}</span>
      ) : (
        undefined
      );
    }
  },
  methods: {
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
        {this.labelNode}
        <md-input
          value={this.value}
          onInput={this.onInput}
          disabled={this.disabled}
          {...{ attrs: this.inputAttrs }}
        />
        {this.helperTextNode}
      </md-field>
    );
  }
});
