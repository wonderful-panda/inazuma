import * as Vue from "vue";
import { component } from "vueit";

@component<Welcome>({
    render(h: typeof Vue.prototype.$createElement) {
        return h("div", [
            h("h1", "INAZUMA"),
            h("h2", "git repository viewer powered by Electron")
        ]);
    }
})
export class Welcome extends Vue {
}
