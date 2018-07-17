import Vue, { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VButton from "./base/VButton";
import VModal from "./base/VModal";
import VTextField from "./base/VTextField";
import * as md from "view/utils/md-classes";
import { __sync } from "babel-plugin-vue-jsx-modifier/lib/modifiers";

export default tsx.component(
  // @vue/component
  {
    name: "PreferencePanel",
    props: {
      active: p(Boolean).required,
      initialConfig: p.ofObject<Config>().required,
      save: p.ofFunction<(config: Config) => Promise<void>>().required,
      hide: p.ofFunction<() => void>().required
    },
    data() {
      // don't use passed config directly.
      return {
        config: JSON.parse(JSON.stringify(this.initialConfig)) as Config
      };
    },
    mounted() {
      Vue.nextTick(() => {
        const input = this.$el.querySelector("input") as HTMLInputElement;
        if (input) {
          input.focus();
        }
      });
    },
    methods: {
      async onOk() {
        await this.save(this.config);
        this.hide();
      },
      renderSubheader(text: string): VNode {
        return (
          <md-subheader class={[md.PRIMARY, style.subHeader]}>
            {text}
          </md-subheader>
        );
      }
    },
    render(): VNode {
      if (!this.active) {
        return <div style={{ display: "none" }} />;
      }
      const config = this.config;
      return (
        <VModal
          class={style.modalBase}
          title="PREFERENCE"
          containerClass={style.container}
          onClose={this.hide}
        >
          <form class={style.modalContent} action="#">
            {this.renderSubheader("Font settings")}
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
            {this.renderSubheader("External tools")}
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
            {this.renderSubheader("Miscellaneous")}
            <VTextField
              class={style.numberInput}
              label="Number of recent opened list"
              inputAttrs={{ type: "number", min: 0, max: 20 }}
              value={__sync(config.recentListCount)}
            />
            <VTextField
              class={style.input}
              label="Path of vue dev tool"
              value={__sync(config.vueDevTool)}
            />
          </form>
          <template slot="footer-buttons">
            <VButton primary mini onClick={this.onOk}>
              <span class={md.TITLE}>SAVE</span>
            </VButton>
            <VButton mini onClick={this.hide}>
              <span class={md.TITLE}>CANCEL</span>
            </VButton>
          </template>
        </VModal>
      );
    }
  },
  ["active", "initialConfig", "save", "hide"]
);

const style = css`
  .${"container"} {
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

  .${"subHeader"} {
    padding: 0;
    min-height: 26px;
  }

  .${"modalBase"} {
    &:global(.modal-enter),
    &:global(.modal-leave-to) {
      .container {
        transform: translateX(-100%);
      }
    }
  }

  .${"modalContent"} {
    padding-left: 8px;
    padding-right: 32px;
  }

  .${"input"} {
    margin-left: 1em;
  }
  .${"numberInput"} {
    margin-left: 1em;
    min-width: 200px;
    width: 200px;
  }
`;