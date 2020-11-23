import Vue from "vue";
import * as vca from "vue-tsx-support/lib/vca";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import ResizeSensor from "vue-resizesensor";
import { ref, watch, onBeforeUnmount, onActivated } from "@vue/composition-api";
import { injectErrorHandler } from "./injection/errorHandler";
import { required, withDefault } from "./base/prop";

type Shell = {
  ptyCommands: { [K in keyof PtyCommands]: (payload: PtyCommands[K]) => Promise<void> };
  term: Terminal;
  fitAddon: FitAddon;
};

export default vca.component({
  name: "Terminal",
  props: {
    cmd: required(String),
    hide: required(Function),
    args: withDefault<readonly string[]>(Array, () => []),
    cwd: withDefault(String, "."),
    fontFamily: withDefault(String, "monospace"),
    fontSize: withDefault(Number, 14)
  },
  setup(p) {
    const shell = ref<Shell | null>(null);
    const el = ref<HTMLDivElement | null>(null);
    const errorHandler = injectErrorHandler();
    const openShell = async () => {
      if (shell.value) {
        shell.value.term.focus();
        return;
      }
      try {
        const { cmd: file, args, cwd, fontFamily, fontSize } = p;
        const term = new Terminal({ fontFamily, fontSize });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        const options = { file, args, cwd };
        const listeners = {
          onData: (data: string) => term.write(data),
          onExit: () => {
            term.dispose();
            fitAddon.dispose();
            shell.value = null;
            p.hide();
          }
        };
        const ptyInvoker = await window.pty.open(options, listeners);
        term.onData((data) => ptyInvoker.data(data));
        term.onResize((payload) => ptyInvoker.resize(payload));
        shell.value = { ptyCommands: ptyInvoker, term, fitAddon };
        Vue.nextTick(() => {
          if (el.value) {
            term.open(el.value);
            fitAddon.fit();
            term.focus();
          }
        });
      } catch (error) {
        errorHandler.handleError({ error });
        p.hide();
      }
    };
    const terminateShell = () => {
      if (!shell.value) {
        return;
      }
      shell.value.ptyCommands.kill({});
      shell.value = null;
    };
    const onResized = () => {
      if (shell.value !== null) {
        shell.value.fitAddon.fit();
        shell.value.term.refresh(0, shell.value.term.rows - 1);
      }
    };

    onActivated(openShell);
    onBeforeUnmount(terminateShell);

    watch(
      () => p.fontFamily,
      (v) => {
        if (shell.value) {
          shell.value.term.setOption("fontFamily", v);
        }
      }
    );
    watch(
      () => p.fontSize,
      (v) => {
        if (shell.value) {
          shell.value.term.setOption("fontSize", v);
        }
      }
    );
    return () => (
      <div ref={el} style="position: relative; flex: 1; overflow: hidden;">
        <ResizeSensor debounce={0} throttle={50} onResized={onResized} />
      </div>
    );
  }
});
