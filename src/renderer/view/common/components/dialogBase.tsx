import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";
import { DialogState, DialogActions } from "../storeModules/dialog";

interface DialogBaseProps {
    state: DialogState | undefined;
    actions: DialogActions | undefined;
}

@typed.component<DialogBaseProps>({
    props: {
        state: p.Obj,
        actions: p.Obj
    }
})
export class DialogBase extends typed.TypedComponent<DialogBaseProps> {
    render(h: Vue.CreateElement) {
        const opt = this.$props.state.options;
        const actions = this.$props.actions;
        if (!opt) {
            return "";
        }
        const content = opt.renderContent(h);
        const staticClass = "dialog-base";
        const props = { title: opt.title };
        const on = { close: () => actions.cancel() };
        const buttons = opt.buttons.map(b => {
                            return h("text-button", {
                                staticClass: "footer-text-button",
                                key: b.name,
                                props: { dense: true, primary: b.primary, accent: b.accent },
                                nativeOn: { click: () => actions.accept(b.name) }
                            }, b.text);
                        });

        return h("modal", { staticClass, props, on }, [
            content,
            h("template", { slot: "footer-buttons" }, buttons)
        ]);
    }
}
