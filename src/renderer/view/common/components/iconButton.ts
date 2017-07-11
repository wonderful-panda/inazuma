import Vue from "vue";

export const IconButton = Vue.extend({
    name: "IconButton",
    render(h) {
        return h("a", {
            class: [
                "material-icons"
            ],
            attrs: {
                href: "javascript: void(0)"
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

