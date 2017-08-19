import Vue from "vue";
import VueRouter from "vue-router";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface NavigationLinkProps {
    icon: string;
    text: string;
    navigateTo?: VueRouter.RawLocation;
}

@typed.component<NavigationLinkProps>({
    name: "NavigationLink",
    props: {
        icon: p.Str.Required,
        text: p.Str.Required,
        navigateTo: p.Any
    }
})
export class NavigationLink extends typed.TypedComponent<NavigationLinkProps> {
    _tsxattrs: TsxComponentAttrs<NavigationLinkProps>;
    render(h: Vue.CreateElement) {
        const p = this.$props;
        const children = [
            <i class="material-icons mdc-list-item__start-detail">{ p.icon }</i>,
            <span class="mdc-typography--title">{ p.text }</span>
        ];
        if (p.navigateTo) {
            return <router-link class="mdc-list-item" to={ p.navigateTo }>{ children }</router-link>;
        }
        else {
            return <a class="mdc-list-item" href="javascript:void(0)">{ children }</a>;
        }
    }
}
