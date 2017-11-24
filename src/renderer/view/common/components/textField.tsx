import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import * as typed from "vue-typed-component";
import p from "vue-strict-prop";

interface TextFieldProps {
    type: "text" | "number" | "email" | "password" | "url" | "search";
    value?: string | number;
    autofocus?: boolean;
    required?: boolean;
    disabled?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    inputId?: string;
    label?: string;
}

interface Validation {
    validity: ValidityState;
    message: string;
}

interface TextFieldEvents {
    input: string;
    validation: Validation;
}

interface TextFieldEventsOn {
    onInput: string;
    onValidation: Validation;
}

@typed.component(TextField, {
    props: {
        type: p.ofStringLiterals("text", "number", "email", "password", "url", "search").default("text"),
        value: p(String, Number).optional,
        autofocus: p(Boolean).default(false),
        required: p(Boolean).default(false),
        disabled: p(Boolean).default(false),
        min: p(Number).optional,
        max: p(Number).optional,
        pattern: p(String).optional,
        inputId: p(String).optional,
        label: p(String).optional
    },
    mounted() {
        this.validate();
        this.$el.classList.add("mdc-text-field--upgraded");
    }
})
export class TextField extends typed.EvTypedComponent<TextFieldProps, TextFieldEvents, TextFieldEventsOn> {
    $refs: { input: HTMLInputElement };

    get containerData() {
        return {
            class: {
                "mdc-text-field": true,
                "mdc-text-field--disabled": this.$props.disabled,
            },
            attrs: {
                "data-mdc-auto-init": "MDCTextField",
            }
        };
    }
    get inputData() {
        const p = this.$props;
        const ref = "input";
        const class_ = ["mdc-text-field__input"];
        if (p.disabled) {
            class_.push("mdc-text-field--disabled");
        }
        const style = { flex: 1 };
        const attrs = {
            id: p.inputId, type: p.type, min: p.min, max: p.max, pattern: p.pattern,
        };
        const domProps = {
            value: p.value,  required: p.required, disabled: p.disabled, autofocus: p.autofocus,
        };
        const on = {
            input: this.onInput
        };
        return { ref, class: class_, style, attrs, domProps, on };
    }
    render(): VNode {
        const p = this.$props;
        if (p.label) {
            return (
                <label { ...this.containerData }>
                    <input { ...this.inputData } />
                    <span class="mdc-text-field__label" style="white-space: nowrap;">
                        { p.label }
                    </span>
                </label>
            );
        }
        else {
            return (
                <div { ...this.containerData }>
                    <input { ...this.inputData } />
                </div>
            );
        }
    }
    onInput(event: Event) {
        this.$emit("input", this.$refs.input.value);
        this.validate();
    }
    validate() {
        const { validity, validationMessage } = this.$refs.input;
        this.$events.emit("validation", { validity, message: validationMessage });
    }
}


export const TextFieldHelptext = tsx.component({
    props: {
        persistent: p(Boolean).default(false)
    },
    computed: {
        classes(): object {
            return {
                "mdc-textfield-helptext": true,
                "mdc-textfield-helptext--persistent": this.persistent
            };
        }
    },
    render(): VNode {
        return <p class={ this.classes }>{ this.$slots.default }</p>;
    }
});

