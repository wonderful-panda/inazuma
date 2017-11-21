import { VNode } from "vue";
import { RawLocation } from "vue-router";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";

export const NavigationLink = tsx.componentFactoryOf<{ onClick: MouseEvent }>().create({
    name: "NavigationLink",
    props: {
        icon: p(String).required,
        text: p(String).required,
        navigateTo: p.ofAny().optional
    },
    methods: {
        onClick(e: MouseEvent) {
            this.$emit("click", e);
        }
    },
    render(): VNode {
        const children = [
            <i class="material-icons mdc-list-item__start-detail">{ this.icon }</i>,
            <span class="mdc-typography--title">{ this.text }</span>
        ];
        if (this.navigateTo) {
            return <router-link class="mdc-list-item" to={ this.navigateTo } nativeOn-click={ this.onClick }>{ children }</router-link>;
        } else {
            return <a class="mdc-list-item" href="javascript:void(0)" onClick={ this.onClick }>{ children }</a>;
        }
    }
}, ["icon", "text"]);

