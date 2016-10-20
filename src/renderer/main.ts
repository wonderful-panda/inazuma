import * as Vue from "vue";
import { component } from "vueit";

interface AppData {
    message: string;
}

@component<App>({
    data(): AppData {
        return {
            message: "Hello vuejs."
        };
    },
    render(h) {
        return h("h1", [ this.$data.message ]);
    }
})
export class App extends Vue {
    $data: AppData;
}

new Vue({
    el: "#app",
    render(h) {
        return h(App);
    }
});
