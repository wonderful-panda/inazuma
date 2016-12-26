import * as Vue from "vue";
import { MainLayout } from "./mainLayout";
import { DrawerLink } from "./drawerLink";
import * as typed from "vue-typed-component";
import { PropOptions } from "../propOptions";

interface IconButtonProps {
    forElement: String;
}
@typed.component<IconButtonProps, IconButton>({
    ...<CompiledTemplate>require("./icon-button.pug"),
    props: {
        forElement: String
    }
})
class IconButton extends typed.TypedComponent<IconButtonProps> {
};

interface FabButtonProps {
    accent: boolean;
}
@typed.component<FabButtonProps, FabButton>({
    ...<CompiledTemplate>require("./fab-button.pug"),
    props: {
        accent: PropOptions.booleanDefault(false)
    }
})
class FabButton extends typed.TypedComponent<FabButtonProps> {
    get additionalClass() {
        return "mdl-button--" + (this.$props.accent ? "accent" : "primary");
    }
};

interface TextFieldProps {
    inputId: string;
    hintText: string;
}
@typed.component<TextFieldProps, TextField>({
    ...<CompiledTemplate>require("./textfield.pug"),
    props: {
        inputId: PropOptions.stringDefault(""),
        hintText: String
    }
})
class TextField extends typed.TypedComponent<TextFieldProps> {
};

Vue.component("icon-button", IconButton);
Vue.component("fab-button", FabButton);
Vue.component("textfield", TextField);

Vue.component("main-layout", MainLayout);
Vue.component("drawer-link", DrawerLink);
