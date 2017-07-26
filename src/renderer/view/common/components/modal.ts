import Vue from "vue";
import * as mdc from "material-components-web";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";

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
    $refs: { footer: HTMLDivElement, firstButton: Vue, lastButton: Vue }

    mounted() {
        Vue.nextTick(() => {
            mdc.autoInit(this.$el, () => {});
            const footerButtons = this.$refs.footer.querySelectorAll("button, input");
            for (let i = 0; i < footerButtons.length; ++i) {
                const el = footerButtons[i] as HTMLInputElement | HTMLButtonElement;
                el.focus();
                if (document.activeElement === el) {
                    break;
                }
            }
        });
    }

    onCancel() {
        this.$events.emit("close", null);
    }

    onFirstButtonTabDown(event: KeyboardEvent) {
        if (event.shiftKey) {
            this.$refs.lastButton.$el.focus();
            event.preventDefault();
        }
    }

    onLastButtonTabDown(event: KeyboardEvent) {
        if (!event.shiftKey) {
            this.$refs.firstButton.$el.focus();
            event.preventDefault();
        }
    }
}
