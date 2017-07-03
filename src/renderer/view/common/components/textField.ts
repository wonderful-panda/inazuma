import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface TextFieldProps {
    type: "text" | "number";
    value: string | number | undefined;
    label: string | undefined;
    useFloatingLabel: boolean;
    inputId: string;
    required: boolean;
    min: number | undefined;
    max: number | undefined;
    pattern: string | undefined;
    errorMessage: string | undefined;
}

interface TextFieldData {
    validationMessage: string | undefined;
}

@typed.component<TextFieldProps>({
    ...<CompiledTemplate>require("./textField.pug"),
    props: {
        type: p.Str.Default("text"),
        value: p.ofType([String, Number]),
        label: p.Str,
        useFloatingLabel: p.Bool.Default(false),
        inputId: p.Str.Required,
        required: p.Bool.Default(false),
        min: p.Num,
        max: p.Num,
        pattern: p.Str,
        errorMessage: p.Str
    }
})
export class TextField extends typed.StatefulTypedComponent<TextFieldProps, TextFieldData> {
    $refs: { input: HTMLInputElement };

    data(): TextFieldData {
        return { validationMessage: "" };
    }
    get additionalClass() {
        return this.$props.useFloatingLabel ? "mdl-textfield--floating-label" : undefined;
    }
    onInput(event: Event) {
        const { input } = this.$refs;
        this.$data.validationMessage = input.validationMessage;
        this.$emit("input", input.value);
    }
}
