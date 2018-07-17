import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { MdTooltip, MdIcon, MdInput, MdField } from "./md";

// @vue/component
export default tsx.component({
  name: "VTextField",
  props: {
    value: [String, Number],
    type: String,
    label: String,
    helperText: String,
    required: Boolean,
    disabled: Boolean,
    placeholder: String,
    headIcon: String,
    inlineIcon: String,
    tooltip: String,
    min: Number,
    max: Number
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
      return name ? <MdIcon>{name}</MdIcon> : undefined;
    },
    tooltipNode(text: string | undefined): VNode | undefined {
      return text ? <MdTooltip>{text}</MdTooltip> : undefined;
    },
    onInput(value: string | number | undefined) {
      if (this.type === "number") {
        this.$emit("update:value", (this as any)._n(value));
      } else {
        this.$emit("update:value", value);
      }
    }
  },
  render(): VNode {
    return (
      <MdField>
        {this.iconNode(this.headIcon)}
        {this.labelNode(this.label)}
        <MdInput
          type={this.type}
          placeholder={this.placeholder}
          value={this.value}
          onInput={this.onInput}
          required={this.required}
          disabled={this.disabled}
          {...{ attrs: { min: this.min, max: this.max } }}
        />
        {this.helperTextNode(this.helperText)}
        {this.iconNode(this.inlineIcon)}
        {this.tooltipNode(this.tooltip)}
      </MdField>
    );
  }
});
