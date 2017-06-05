import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface DrawerLinkProps {
    name: string;
    icon: string;
    text: string;
    params: any;
}

@typed.component<DrawerLinkProps>({
    ...<CompiledTemplate>require("./drawer-link.pug"),
    props: {
        name: p.Str.Required,
        icon: p.Str.Required,
        text: p.Str.Required,
        params: p.Any
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
