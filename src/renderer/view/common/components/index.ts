import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";
import { SplitterPanel } from "./splitterPanel";
import { TextField } from "./textField";
import { TextButton } from "./textButton";

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

Vue.component("icon-button", IconButton);
Vue.component("fab-button", FabButton);
Vue.component("text-button", TextButton);
Vue.component("text-field", TextField);
Vue.component("splitter-panel", SplitterPanel);
