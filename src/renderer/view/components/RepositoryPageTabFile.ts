// simple alias of BlamePanel for now.
import Vue from "vue";
import BlamePanel from "./BlamePanel";

export default Vue.extend({
  functional: true,
  render(h, { data }) {
    return h(BlamePanel, {
      ...data,
      style: { margin: "0.5em 1em 0.2em 1em" }
    });
  }
}) as typeof BlamePanel;
