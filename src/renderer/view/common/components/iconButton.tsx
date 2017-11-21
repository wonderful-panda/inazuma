import Vue from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";

export const IconButton = tsx.component({
    name: "IconButton",
    props: {
        disabled: p(Boolean).default(false)
    },
    render(this: Vue, h) {
        const data = {
            class: {
                "material-icons": true,
                "icon-button--disabled": this.$props.disabled
            },
            disabled: this.$props.disabled
        };
        return <button { ...data } onClick={ e => this.$emit("click", e) }>{ this.$slots.default }</button>;
    }
});

export const ToolbarButton = Vue.extend({
    name: "ToolbarButton",
    functional: true,
    render(h, { data, children }) {
        return <IconButton class="mdc-toolbar__icon" { ...data }>{ children }</IconButton>;
    }
}) as typeof IconButton;

export const CloseButton = Vue.extend({
    name: "CloseButton",
    functional: true,
    render(h, { data }) {
        return <IconButton class="custom-button__icon--close" { ...data }>close</IconButton>;
    }
}) as typeof IconButton;

