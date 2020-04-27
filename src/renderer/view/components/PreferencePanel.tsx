import * as vca from "vue-tsx-support/lib/vca";
import p from "vue-strict-prop";
import VButton from "./base/VButton";
import VModal, { ModalContainerClass } from "./base/VModal";
import VTextField from "./base/VTextField";
import * as md from "view/utils/md-classes";
import { __sync } from "babel-plugin-vue-jsx-modifier/lib/modifiers";
import { MdSubheader } from "./base/md";
import * as emotion from "emotion";
import { ref, reactive } from "@vue/composition-api";
import { withClass } from "./base/withClass";
const css = emotion.css;

const style = {
  modalBase: css`
    .${ModalContainerClass} {
      display: flex;
      position: absolute;
      left: 0;
      top: 0;
      width: 80%;
      height: 100%;
      bottom: 0;
      box-shadow: 4px 0 4px rgba(0, 0, 0, 0.4);

      flex: 1;
      transition: all 0.3s ease;
    }
    &.modal-enter,
    &.modal-leave-to {
      .${ModalContainerClass} {
        transform: translateX(-100%);
      }
    }
  `,
  subHeader: css`
    padding: 0;
    min-height: 26px;
  `,
  modalContent: css`
    padding-left: 8px;
    padding-right: 32px;
  `,
  input: css`
    margin-left: 1em;
  `,
  numberInput: css`
    margin-left: 1em;
    min-width: 200px;
    width: 200px;
  `
};

const SubHeader = withClass(MdSubheader, [md.PRIMARY, style.subHeader]);

export default vca.component({
  name: "PreferencePanel",
  props: {
    active: p(Boolean).required,
    initialConfig: p.ofObject<Config>().required,
    save: p.ofFunction<(config: Config) => Promise<void>>().required,
    hide: p.ofFunction<() => void>().required
  },
  setup(p) {
    const formRef = ref(null as HTMLFormElement | null);
    const config = reactive(
      JSON.parse(JSON.stringify(p.initialConfig)) as Config
    );
    const onOk = async () => {
      await p.save(config);
      p.hide();
    };
    return () => {
      if (!p.active) {
        return <div style={{ display: "none" }} />;
      }
      return (
        <VModal class={style.modalBase} title="PREFERENCE" close={p.hide}>
          <form
            ref={formRef.value as any}
            class={style.modalContent}
            action="#"
          >
            <SubHeader>Font Settings</SubHeader>
            <VTextField
              class={style.input}
              label="Default font"
              value={__sync(config.fontFamily.standard)}
            />
            <VTextField
              class={style.input}
              label="Monospace font"
              value={__sync(config.fontFamily.monospace)}
            />
            <SubHeader>External tools</SubHeader>
            <VTextField
              class={style.input}
              label="Path of external diff tool"
              value={__sync(config.externalDiffTool)}
            />
            <VTextField
              class={style.input}
              label="Interactive shell command"
              value={__sync(config.interactiveShell)}
            />
            <SubHeader>Miscellaneous</SubHeader>
            <VTextField
              type="number"
              class={style.numberInput}
              label="Number of recent opened list"
              min={0}
              max={20}
              value={__sync(config.recentListCount)}
            />
          </form>
          <template slot="footer-buttons">
            <VButton primary mini action={onOk}>
              <span class={md.TITLE}>SAVE</span>
            </VButton>
            <VButton mini action={p.hide}>
              <span class={md.TITLE}>CANCEL</span>
            </VButton>
          </template>
        </VModal>
      );
    };
  }
});
