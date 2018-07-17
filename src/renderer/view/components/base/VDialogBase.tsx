import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { DialogState, DialogActions } from "view/store/dialogModule";
import VButton from "./VButton";
import VModal from "./VModal";

// @vue/component
export default tsx.component({
  name: "VDialogBase",
  props: {
    state: p.ofObject<DialogState>().required,
    actions: p.ofObject<DialogActions>().required
  },
  render(): VNode {
    const opt = this.state.options;
    if (!opt) {
      return <div />;
    }
    const { accept, cancel } = this.actions;
    const buttons = opt.buttons.map(b => (
      <VButton
        key={b.name}
        mini
        primary={b.primary}
        accent={b.accent}
        onClick={() => accept(b.name)}
      >
        <span staticClass="md-title">{b.text}</span>
      </VButton>
    ));
    return (
      <VModal
        staticClass={style.dialogBase}
        title={opt.title}
        containerClass={style.container}
        onClose={cancel}
      >
        {opt.renderContent(this.$createElement)}
        <template slot="footer-buttons">
          {buttons}
          <VButton key="__CANCEL__" mini onClick={cancel}>
            <span staticClass="md-title">CANCEL</span>
          </VButton>
        </template>
      </VModal>
    );
  }
});

const style = css`
  .${"container"} {
    margin: auto;
    min-width: 400px;
    box-shadow: 4px 4px 4px rgba(0, 0, 0, 0.4);
    transition: all 0.2s ease;
  }

  .${"dialogBase"} {
    &:global(.modal-enter),
    &:global(.modal-leave-to) {
      .${"container"} {
        transform: scale(1.05);
        opacity: 0;
      }
    }
  }
`;
