import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface TextFieldProps {
    type: "text" | "number" | "email" | "password" | "url" | "search";
    value: string | number | undefined;
    autofocus: boolean;
    required: boolean;
    disabled: boolean;
    min: number | undefined;
    max: number | undefined;
    pattern: string | undefined;
    inputId: string | undefined;
    label: string | undefined;
}

interface Validation {
    validity: ValidityState;
    message: string;
}

interface TextFieldEvents {
    input: string;
    validation: Validation;
}

@typed.component<TextFieldProps, TextField>({
    props: {
        type: p.Str.Default("text"),
        value: p.ofType([String, Number]),
        autofocus: p.Bool.Default(false),
        required: p.Bool.Default(false),
        disabled: p.Bool.Default(false),
        min: p.Num,
        max: p.Num,
        pattern: p.Str,
        inputId: p.Str,
        label: p.Str,
    },
    mounted() {
        this.validate();
        this.$el.classList.add("mdc-textfield--upgraded");
    }
})
export class TextField extends typed.EvTypedComponent<TextFieldProps, TextFieldEvents> {
    $refs: { input: HTMLInputElement };

    get containerData() {
        return {
            class: {
                "mdc-textfield": true,
                "mdc-textfield--disabled": this.$props.disabled,
            },
            attrs: {
                "data-mdc-auto-init": "MDCTextfield",
            }
        };
    }
    get inputData() {
        const p = this.$props;
        const ref = "input";
        const class_ = ["mdc-textfield__input"];
        if (p.disabled) {
            class_.push("mdc-textfield--disabled");
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
    get labelData() {
        const p = this.$props;
        const class_ = "mdc-textfield__label";
        const attrs = { for: p.inputId };
        const style = { "white-space": "nowrap" };
        return { class: class_, style, attrs };
    }
    render(h: Vue.CreateElement) {
        const { label } = this.$props;

        return h(label ? "label" : "div", this.containerData, [
            h("input", this.inputData),
            label ? h("span", this.labelData, label) : undefined
        ]);
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

interface TextFieldHelpTextProps {
    persistent: boolean;
}

@typed.component<TextFieldHelpTextProps>({
    props: {
        persistent: p.Bool.Default(false),
    }
})
export class TextFieldHelptext extends typed.TypedComponent<TextFieldHelpTextProps> {
    get classes() {
        return {
            "mdc-textfield-helptext": true,
            "mdc-textfield-helptext--persistent": this.$props.persistent,
        };
    }
    render(h: Vue.CreateElement) {
        return h("p", { class: this.classes }, this.$slots.default);
    }
}
