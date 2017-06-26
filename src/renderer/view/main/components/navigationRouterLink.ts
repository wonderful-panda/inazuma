import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface NavigationRouterLinkProps {
    name: string;
    icon: string;
    text: string;
    params: any;
}

@typed.component<NavigationRouterLinkProps>({
    ...<CompiledTemplate>require("./navigationRouterLink.pug"),
    props: {
        name: p.Str.Required,
        icon: p.Str.Required,
        text: p.Str.Required,
        params: p.Any
    }
})
export class NavigationRouterLink extends typed.TypedComponent<NavigationRouterLinkProps> {
    get location() {
        return {
            name: this.$props.name,
            params: this.$props.params
        };
    }
}
