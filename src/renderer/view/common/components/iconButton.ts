import Vue from "vue";
import * as p from "vue-typed-component/lib/props";

export const IconButton = Vue.extend({
    name: "IconButton",
    props: {
        disabled: p.Bool.Default(false)
    },
    render(h) {
        return h("button", {
            class: {
                "material-icons": true,
                "icon-button--disabled": this.$props.disabled
            },
            domProps: {
                disabled: this.$props.disabled
            }
        }, [
            this.$slots.default
        ]);
    }
});

export const ToolbarButton = Vue.extend({
    name: "ToolbarButton",
    functional: true,
    render(h, { data, children }) {
        if (!data.class) {
            data.class = [];
        }
        data.class.push("mdc-toolbar__icon");
        return h(IconButton, data, children);
    }
});

export const CloseButton = Vue.extend({
    name: "CloseButton",
    functional: true,
    render(h, { data }) {
        if (!data.class) {
            data.class = [];
        }
        data.class.push("custom-button__icon--close");
        return h(IconButton, data, "close");
    }
});

