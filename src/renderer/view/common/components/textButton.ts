import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface TextButtonProps {
    compact: boolean;
    dense: boolean;
    raised: boolean;
    primary: boolean;
    accent: boolean;
    disabled: boolean;
}

@typed.component<TextButtonProps>({
    props: {
        compact: p.Bool.Default(false),
        dense: p.Bool.Default(false),
        raised: p.Bool.Default(false),
        primary: p.Bool.Default(false),
        accent: p.Bool.Default(false),
        disabled: p.Bool.Default(false)
    }
})
export class TextButton extends typed.TypedComponent<TextButtonProps> {
    get classes() {
        const { compact, dense, raised, primary, accent } = this.$props;
        return {
            "mdc-button": true,
            "mdc-button--compact": compact,
            "mdc-button--dense": dense,
            "mdc-button--raised": raised,
            "mdc-button--primary": primary,
            "mdc-button--accent": accent
        };
    }
    render(h: Vue.CreateElement) {
        const disabled = this.$props.disabled || undefined;
        return h("button", {
            class: this.classes,
            attrs: { disabled: disabled }
        }, this.$slots.default);
    }
}
