import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";
import { SplitterPanel } from "./splitterPanel";
import { TextField } from "./textField";
import { TextButton } from "./textButton";
import { IconButton, ToolbarButton, CloseButton } from "./iconButton";

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
Vue.component("toolbar-button", ToolbarButton);
Vue.component("close-button", CloseButton);
Vue.component("fab-button", FabButton);
Vue.component("text-button", TextButton);
Vue.component("text-field", TextField);
Vue.component("splitter-panel", SplitterPanel);
