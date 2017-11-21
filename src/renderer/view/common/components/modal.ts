import Vue from "vue";
import * as typed from "vue-typed-component";
import p from "vue-strict-prop";
import { queryFocusableElements } from "view/common/domutils";

const mdc: any = require("material-components-web");

interface ModalProps {
    title: string | undefined;
}

interface ModalEvents {
    close: null;
}

@typed.component(Modal, {
    ...<CompiledTemplate>require("./modal.pug"),
    props: {
        title: p(String).required
    }
})
export class Modal extends typed.EvTypedComponent<ModalProps, { close: null }, { onClose: null }> {
    mounted() {
        Vue.nextTick(() => {
            mdc.autoInit(this.$el, () => {});
        });
    }

    onCancel() {
        this.$events.emit("close", null);
    }

    onTabKeyDown(event: KeyboardEvent) {
        const focusable = queryFocusableElements(this.$el);
        if (focusable.length === 0) {
            return;
        }
        if (event.shiftKey) {
            if (event.target === focusable[0]) {
                focusable[focusable.length - 1].focus();
                event.preventDefault();
            }
        }
        else {
            if (event.target === focusable[focusable.length - 1]) {
                focusable[0].focus();
                event.preventDefault();
            }
        }
    }
}
