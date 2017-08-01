import Vue from "vue";
import * as mdc from "material-components-web";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";
import { queryFocusableElements } from "view/common/domutils";

interface ModalProps {
    title: string | undefined;
}

interface ModalEvents {
    close: void;
}

@typed.component<ModalProps>({
    ...<CompiledTemplate>require("./modal.pug"),
    props: {
        title: p.Str.Required
    }
})
export class Modal extends typed.EvTypedComponent<ModalProps, ModalEvents> {
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
