import Vue, { VNode } from "vue";
import { IPty, spawn } from "node-pty";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import p from "vue-strict-prop";
import { withStore, rootMapper } from "view/store";
import ResizeSensor from "vue-resizesensor";

type Shell = { pty: IPty; term: Terminal; fitAddon: FitAddon };

export default withStore.create({
  name: "Terminal",
  props: {
    cmd: p(String).required,
    args: p.ofArray<string>().default(() => []),
    cwd: p(String).default("."),
    fontFamily: p(String).default("monospace"),
    fontSize: p(Number).default(14)
  },
  data() {
    return { shell: null as Shell | null };
  },
  activated() {
    this.openShell();
  },
  beforeDestroy() {
    this.terminateShell();
  },
  methods: {
    ...rootMapper.mapActions(["hideTerminal", "showError"]),
    openShell() {
      if (this.shell) {
        this.shell.term.focus();
        return;
      }
      try {
        const { cmd, args, cwd, fontFamily, fontSize } = this;
        const pty = spawn(cmd, args, { cwd });
        const term = new Terminal({ fontFamily, fontSize });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        pty.on("data", data => term.write(data));
        pty.on("exit", () => {
          term.dispose();
          fitAddon.dispose();
          this.shell = null;
          this.hideTerminal();
        });
        term.onData(data => pty.write(data));
        term.onResize(({ cols, rows }) => pty.resize(cols, rows));
        this.shell = { pty, term, fitAddon };
        Vue.nextTick(() => {
          term.open(this.$el as HTMLElement);
          fitAddon.fit();
          term.focus();
        });
      } catch (error) {
        this.showError({ error });
        this.hideTerminal();
      }
    },
    terminateShell() {
      if (!this.shell) {
        return;
      }
      this.shell.pty.kill();
      this.shell = null;
    },
    onResized() {
      if (this.shell !== null) {
        this.shell.fitAddon.fit();
        this.shell.term.refresh(0, this.shell.term.rows - 1);
      }
    }
  },
  watch: {
    fontFamily() {
      if (this.shell) {
        this.shell.term.setOption("fontFamily", this.fontFamily);
      }
    },
    fontSize() {
      if (this.shell) {
        this.shell.term.setOption("fontSize", this.fontSize);
      }
    }
  },
  render(): VNode {
    return (
      <div style="position: relative; flex: 1; overflow: hidden;">
        <ResizeSensor debounce={0} throttle={50} onResized={this.onResized} />
      </div>
    );
  }
});
