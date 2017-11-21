import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";

export const TextButton = tsx.componentFactoryOf<{ onClick: MouseEvent }>().create({
    props: {
        compact: p(Boolean).default(false),
        dense: p(Boolean).default(false),
        raised: p(Boolean).default(false),
        primary: p(Boolean).default(false),
        accent: p(Boolean).default(false),
        disabled: p(Boolean).default(false)
    },
    computed: {
        classes(): object {
            const { compact, dense, raised, primary, accent } = this;
            return {
                "mdc-button": true,
                "mdc-button--compact": compact,
                "mdc-button--dense": dense,
                "mdc-button--raised": raised,
                "mdc-button--primary": primary,
                "mdc-button--accent": accent
            };
        }
    },
    render(): VNode {
        const disabled = this.disabled || undefined;
        return (
            <button class={ this.classes } disabled={ disabled } onClick={ e => this.$emit("click", e) }>
                { this.$slots.default }
            </button>
        );
    }
});

