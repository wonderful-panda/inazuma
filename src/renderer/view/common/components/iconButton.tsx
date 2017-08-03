import Vue from "vue";
import * as p from "vue-typed-component/lib/props";

export const IconButton = $tsx.createComponent<{ disabled?: false }>({
    name: "IconButton",
    props: {
        disabled: p.Bool.Default(false)
    },
    render(this: Vue, h) {
        const data = {
            class: {
                "material-icons": true,
                "icon-button--disabled": this.$props.disabled
            },
            disabled: this.$props.disabled
        };
        return <button { ...data }>{ this.$slots.default }</button>;
    }
});

export const ToolbarButton = $tsx.createComponent({
    name: "ToolbarButton",
    functional: true,
    render(h, { data, children }) {
        return <IconButton class="mdc-toolbar__icon" { ...data }>{ children }</IconButton>;
    }
});

export const CloseButton = $tsx.createComponent({
    name: "CloseButton",
    functional: true,
    render(h, { data }) {
        return <IconButton class="custom-button__icon--close" { ...data }>close</IconButton>;
    }
});

