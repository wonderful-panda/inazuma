import Vue from "vue";
import * as p from "vue-typed-component/lib/props";

interface IconButtonProps {
    disabled?: boolean;
}

interface IconButtonEvents {
    click: MouseEvent;
}

export const IconButton = $tsx.createComponent<IconButtonProps, IconButtonEvents>({
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

