import * as Vue from "vue";
import { component, prop } from "vueit";

@component<IconButton>({
    compiledTemplate: require("./icon-button.pug")
})
class IconButton extends Vue {
    @prop forElement: string;
};

@component<FabButton>({
    compiledTemplate: require("./fab-button.pug")
})
class FabButton extends Vue {
    @prop.default(false) accent: boolean;
    get additionalClass() {
        return "mdl-button--" + (this.accent ? "accent" : "primary");
    }
};

@component<TextField>({
    compiledTemplate: require("./textfield.pug")
})
class TextField extends Vue {
    @prop.default("") inputId: string;
    @prop hintText: string;
};

Vue.component("icon-button", IconButton);
Vue.component("fab-button", FabButton);
Vue.component("textfield", TextField);

