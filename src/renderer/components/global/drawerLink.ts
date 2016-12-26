import * as typed from "vue-typed-component";
import { PropOptions } from "../propOptions";

interface DrawerLinkProps {
    name: string;
    icon: string;
    text: string;
    params: any;
}

@typed.component<DrawerLinkProps, DrawerLink>({
    ...<CompiledTemplate>require("./drawer-link.pug"),
    props: {
        name: PropOptions.stringRequired(),
        icon: PropOptions.stringRequired(),
        text: PropOptions.stringRequired(),
        params: {}
    }
})
export class DrawerLink extends typed.TypedComponent<DrawerLinkProps> {
    get location() {
        return {
            name: this.$props.name,
            params: this.$props.params
        };
    }
}
