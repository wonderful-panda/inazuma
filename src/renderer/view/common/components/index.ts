import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";
import { SplitterPanel } from "./splitterPanel";

interface IconButtonProps {
    forElement: String;
}
@typed.component<IconButtonProps>({
    ...<CompiledTemplate>require("./icon-button.pug"),
    props: {
        forElement: p.Str
    }
})
class IconButton extends typed.TypedComponent<IconButtonProps> {
}

interface FabButtonProps {
    accent: boolean;
}
@typed.component<FabButtonProps>({
    ...<CompiledTemplate>require("./fab-button.pug"),
    props: {
        accent: p.Bool.Default(false)
    }
})
class FabButton extends typed.TypedComponent<FabButtonProps> {
    get additionalClass() {
        return "mdl-button--" + (this.$props.accent ? "accent" : "primary");
    }
}

interface TextFieldProps {
    inputId: string;
    hintText: string;
    showFloatingLabel: boolean;
    value: string;
}
@typed.component<TextFieldProps>({
    ...<CompiledTemplate>require("./textfield.pug"),
    props: {
        inputId: p.Str.Default(""),
        hintText: p.Str,
        value: p.Str,
        showFloatingLabel: p.Bool.Default(false)
    }
})
class TextField extends typed.TypedComponent<TextFieldProps> {
    $refs: { input: HTMLInputElement };
    get className() {
        return this.$props.showFloatingLabel ? "mdl-textfield--floating-label" : undefined;
    }
    onInput(e: Event) {
        this.$emit('input', this.$refs.input.value);
    }
}

Vue.component("icon-button", IconButton);
Vue.component("fab-button", FabButton);
Vue.component("textfield", TextField);
Vue.component("splitter-panel", SplitterPanel);
