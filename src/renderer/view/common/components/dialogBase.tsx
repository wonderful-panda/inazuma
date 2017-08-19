import Vue from "vue";
import * as typed from "vue-typed-component";
import * as p from "vue-typed-component/lib/props";
import { DialogState, DialogActions } from "../storeModules/dialog";
import { TextButton } from "./textButton";
import { Modal } from "./modal";

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
    _tsxattrs: TsxComponentAttrs<DialogBaseProps>;
    render(h: Vue.CreateElement) {
        const opt = this.$props.state.options;
        const actions = this.$props.actions;
        if (!opt) {
            return "";
        }
        const buttons = opt.buttons.map(b =>
            <TextButton class="footer-text-button" key={ b.name }
                        dense primary={ b.primary } accent={ b.accent }
                        nativeOnClick={ () => actions.accept(b.name) }>
                { b.text }
            </TextButton>
        );
        return (
            <Modal class="dialog-base" title={ opt.title } onClose={ actions.cancel }>
                { opt.renderContent(h) }
                <template slot="footer-buttons">
                    { buttons }
                </template>
            </Modal>
        );
    }
}
