import Vue from "vue";
import * as vca from "vue-tsx-support/lib/vca";
import { IPty, spawn } from "node-pty";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import p from "vue-strict-prop";
import { useRootModule } from "view/store";
import ResizeSensor from "vue-resizesensor";
import { ref, watch, onBeforeUnmount, onActivated } from "@vue/composition-api";

type Shell = { pty: IPty; term: Terminal; fitAddon: FitAddon };

export default vca.component({
  name: "Terminal",
  props: {
    cmd: p(String).required,
    hide: p.ofFunction<() => void>().required,
    args: p.ofArray<string>().default(() => []),
    cwd: p(String).default("."),
    fontFamily: p(String).default("monospace"),
    fontSize: p(Number).default(14)
  },
  setup(p) {
    const rootModule = useRootModule();
    const shell = ref<Shell | null>(null);
    const el = ref<HTMLDivElement | null>(null);
    const openShell = () => {
      if (shell.value) {
        shell.value.term.focus();
        return;
      }
      try {
        const { cmd, args, cwd, fontFamily, fontSize } = p;
        const pty = spawn(cmd, args, { cwd });
        const term = new Terminal({ fontFamily, fontSize });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        pty.on("data", data => term.write(data));
        pty.on("exit", () => {
          term.dispose();
          fitAddon.dispose();
          shell.value = null;
          p.hide();
        });
        term.onData(data => pty.write(data));
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
        rootModule.actions.showError({ error });
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
      v => {
        if (shell.value) {
          shell.value.term.setOption("fontFamily", v);
        }
      }
    );
    watch(
      () => p.fontSize,
      v => {
        if (shell.value) {
          shell.value.term.setOption("fontSize", v);
        }
      }
    );
    return () => (
      <div
        ref={el as any}
        style="position: relative; flex: 1; overflow: hidden;"
      >
        <ResizeSensor debounce={0} throttle={50} onResized={onResized} />
      </div>
    );
  }
});
