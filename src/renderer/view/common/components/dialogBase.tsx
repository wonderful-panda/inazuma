import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { DialogState, DialogActions } from "../storeModules/dialog";
import { TextButton } from "./textButton";
import { Modal } from "./modal";

interface DialogBaseProps {
    state: DialogState;
    actions: DialogActions;
}

export const DialogBase = tsx.component({
    name: "DialogBase",
    props: {
        state: p.ofObject<DialogState>().required,
        actions: p.ofObject<DialogActions>().required
    },
    render(): VNode {
        const opt = this.state.options;
        if (!opt) {
            return <div />;
        }
        const actions = this.actions;
        const buttons = opt.buttons.map(b =>
            <TextButton class="footer-text-button" key={ b.name }
                        dense primary={ b.primary } accent={ b.accent }
                        onClick={ () => actions.accept(b.name) }>
                { b.text }
            </TextButton>
        );
        return (
            <Modal class="dialog-base" title={ opt.title } onClose={ actions.cancel }>
                { opt.renderContent(this.$createElement) }
                <template slot="footer-buttons">
                    { buttons }
                    <TextButton class="footer-text-button" key="__CANCEL__" dense onClick={ actions.cancel }>
                        CANCEL
                    </TextButton>
                </template>
            </Modal>
        );
    }
}, ["state", "actions"]);

