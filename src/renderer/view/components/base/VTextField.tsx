import * as vca from "vue-tsx-support/lib/vca";
import { MdTooltip, MdIcon, MdInput, MdField } from "./md";
import { toNumber } from "core/utils";
import { optional } from "./prop";

export default vca.component({
  name: "VTextField",
  props: {
    value: optional([String, Number]),
    type: optional(String),
    label: optional(String),
    helperText: optional(String),
    required: optional(Boolean),
    disabled: optional(Boolean),
    placeholder: optional(String),
    headIcon: optional(String),
    inlineIcon: optional(String),
    tooltip: optional(String),
    min: optional(Number),
    max: optional(Number),
    size: optional(Number)
  },
  setup(p, ctx) {
    const update = vca.updateEmitter<typeof p>();
    const labelNode = (name: string | undefined) =>
      name ? <label>{name}</label> : undefined;

    const helperTextNode = (name: string | undefined) =>
      name ? <span staticClass="md-helper-text">{name}</span> : undefined;

    const iconNode = (name: string | undefined) =>
      name ? <MdIcon>{name}</MdIcon> : undefined;

    const tooltipNode = (text: string | undefined) =>
      text ? <MdTooltip>{text}</MdTooltip> : undefined;

    const onInput = (value: string | number) => {
      if (p.type === "number") {
        update(ctx, "value", toNumber(value));
      } else {
        update(ctx, "value", value);
      }
    };

    return () => (
      <MdField>
        {iconNode(p.headIcon)}
        {labelNode(p.label)}
        <MdInput
          type={p.type}
          placeholder={p.placeholder}
          value={p.value}
          onInput={onInput}
          required={p.required}
          disabled={p.disabled}
          {...{ attrs: { min: p.min, max: p.max, size: p.size } }}
        />
        {helperTextNode(p.helperText)}
        {iconNode(p.inlineIcon)}
        {tooltipNode(p.tooltip)}
      </MdField>
    );
  }
});
