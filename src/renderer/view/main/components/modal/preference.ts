import Vue from "vue";
import * as typed from "vue-typed-component";
import { AppStore } from "../../store";

interface PreferenceData {
    config: Config;
    error: {
        recentListCount: string | undefined
    };
}

@typed.component<{}>({
    ...<CompiledTemplate>require("./preference.pug"),
    props: {}
})
export default class Preference extends typed.StatefulTypedComponent<{}, PreferenceData> {
    $store: AppStore;
    data(): PreferenceData {
        // don't pass state.config directly.
        return {
            config: JSON.parse(JSON.stringify(this.$store.state.config)),
            error: {
                "recentListCount": undefined
            }
        };
    }
    mounted() {
        Vue.nextTick(() => {
            const input = this.$el.querySelector("input") as HTMLInputElement;
            if (input) {
                input.focus();
            }
        });
    }
    back() {
        this.$router.back();
    }
    async onOk() {
        await this.$store.actions.resetConfig(this.$data.config);
        this.$router.back();
    }
}

