import Vue from "vue";
import * as typed from "vue-typed-component";
import { AppStore } from "../../mainTypes";

interface PreferenceData {
    config: Config;
}

@typed.component<{}>({
    ...<CompiledTemplate>require("./preference.pug"),
    props: {},
    created() {
        Vue.nextTick(() => {
            componentHandler.upgradeDom();
        });
    }
})
export class Preference extends typed.StatefulTypedComponent<{}, PreferenceData> {
    $store: AppStore;
    data() {
        // don't pass state.config directly.
        return {
            config: JSON.parse(JSON.stringify(this.$store.state.config))
        };
    }
    back() {
        this.$router.back();
    }
    async onOk() {
        await this.$store.dispatch("resetConfig", this.$data.config);
        this.$router.back();
    }
}

