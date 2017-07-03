import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface TextButtonProps {
    text: string;
    color: "primary" | "accent" | undefined;
    raised: boolean;
    disabled: boolean;
}

@typed.component<TextButtonProps>({
    props: {
        text: p.Str.Required,
        color: p.Str,
        raised: p.Bool.Default(false),
        disabled: p.Bool.Default(false)
    }
})
export class TextButton extends typed.TypedComponent<TextButtonProps> {
    render(h: Vue.CreateElement) {
        const props = this.$props;
        const classes = {
            "mdl-button": true,
            "mdl-js-button": true,
            "mdl-button--raised": props.raised,
            "mdl-button--primary": props.color === "primary",
            "mdl-button--accent": props.color === "accent"
        }
        return h("button", {
            class: classes,
            attrs: { disabled: props.disabled || undefined }
        }, props.text);
    }
}

