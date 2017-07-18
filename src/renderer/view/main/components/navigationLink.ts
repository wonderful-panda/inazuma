import Vue from "vue";
import VueRouter from "vue-router";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

interface NavigationLinkProps {
    icon: string;
    text: string;
    navigateTo: VueRouter.RawLocation | undefined;
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
    render(h: Vue.CreateElement) {
        const p = this.$props;
        const children = [
            h("i", { class: ["material-icons", "mdc-list-item__start-detail"]}, p.icon),
            h("span", { class: "mdc-typography--title" }, p.text)
        ];
        if (p.navigateTo) {
            return h("router-link", { class: "mdc-list-item", props: { to: p.navigateTo } }, children);
        }
        else {
            return h("a", { class: "mdc-list-item", attrs: { href: "javascript:void(0)" } }, children);
        }
    }
}
