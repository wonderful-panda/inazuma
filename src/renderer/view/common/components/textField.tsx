import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

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
    _tsxattrs: TsxComponentAttrs<TextFieldProps, TextFieldEventsOn>;
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
    render(h: Vue.CreateElement) {
        const p = this.$props;
        if (p.label) {
            return (
                <label { ...this.containerData }>
                    <input { ...this.inputData } />
                    <span class="mdc-textfield__label" style="white-space: nowrap;">
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

interface TextFieldHelpTextProps {
    persistent: boolean;
}

@typed.component<TextFieldHelpTextProps>({
    props: {
        persistent: p.Bool.Default(false),
    }
})
export class TextFieldHelptext extends typed.TypedComponent<TextFieldHelpTextProps> {
    _tsxattrs: TsxComponentAttrs<TextFieldHelpTextProps>;
    get classes() {
        return {
            "mdc-textfield-helptext": true,
            "mdc-textfield-helptext--persistent": this.$props.persistent,
        };
    }
    render(h: Vue.CreateElement) {
        return <p class={ this.classes }>{ this.$slots.default }</p>;
    }
}
