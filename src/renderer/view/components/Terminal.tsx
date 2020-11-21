import Vue from "vue";
import * as vca from "vue-tsx-support/lib/vca";
import { IPty, spawn } from "node-pty";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import ResizeSensor from "vue-resizesensor";
import { ref, watch, onBeforeUnmount, onActivated } from "@vue/composition-api";
import { injectErrorHandler } from "./injection/errorHandler";
import { required, withDefault } from "./base/prop";

type Shell = { pty: IPty; term: Terminal; fitAddon: FitAddon };

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
    const openShell = () => {
      if (shell.value) {
        shell.value.term.focus();
        return;
      }
      try {
        const { cmd, args, cwd, fontFamily, fontSize } = p;
        const pty = spawn(cmd, args as string[], { cwd });
        const term = new Terminal({ fontFamily, fontSize });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        pty.on("data", (data) => term.write(data));
        pty.on("exit", () => {
          term.dispose();
          fitAddon.dispose();
          shell.value = null;
          p.hide();
        });
        term.onData((data) => pty.write(data));
        term.onResize(({ cols, rows }) => pty.resize(cols, rows));
        shell.value = { pty, term, fitAddon };
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
      shell.value.pty.kill();
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
