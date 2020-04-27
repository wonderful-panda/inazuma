import * as vca from "vue-tsx-support/lib/vca";
import p from "vue-strict-prop";
import { DialogState } from "view/store/dialogModule";
import VButton from "./VButton";
import VModal, { ModalContainerClass } from "./VModal";
import * as emotion from "emotion";
import { createElement } from "@vue/composition-api";
const css = emotion.css;

export default vca.component({
  name: "VDialogBase",
  props: {
    state: p.ofObject<DialogState>().required,
    accept: p.ofFunction<{ buttonId: string }, void>().required,
    cancel: p.ofFunction<() => void>().required
  },
  setup(p) {
    return () => {
      const opt = p.state.options;
      if (!opt) {
        return <div />;
      }
      const { accept, cancel } = p;
      const buttons = opt.buttons.map(b => (
        <VButton
          key={b.name}
          mini
          primary={b.primary}
          accent={b.accent}
          action={() => accept({ buttonId: b.name })}
        >
          <span staticClass="md-title">{b.text}</span>
        </VButton>
      ));
      return (
        <VModal staticClass={style.dialogBase} title={opt.title} close={cancel}>
          {opt.renderContent(createElement)}
          <template slot="footer-buttons">
            {buttons}
            <VButton key="__CANCEL__" mini action={cancel}>
              <span staticClass="md-title">CANCEL</span>
            </VButton>
          </template>
        </VModal>
      );
    };
  }
});

const style = {
  dialogBase: css`
    .${ModalContainerClass} {
      margin: auto;
      min-width: 400px;
      box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.4);
      transition: all 0.2s ease;
    }

    &.modal-enter,
    &.modal-leave-to {
      .${ModalContainerClass} {
        transform: scale(1.05);
        opacity: 0;
      }
    }
  `
};
