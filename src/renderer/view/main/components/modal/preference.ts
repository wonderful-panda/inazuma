import Vue from "vue";
import * as mdc from "material-components-web";
import * as typed from "vue-typed-component";
import { AppStore } from "../../mainTypes";

interface PreferenceData {
    config: Config;
    error: {
        recentListCount: string | undefined
    };
}

@typed.component<{}>({
    ...<CompiledTemplate>require("./preference.pug"),
    props: {},
    created() {
        Vue.nextTick(() => {
            mdc.autoInit(this.$el, () => {});
        });
    }
})
export class Preference extends typed.StatefulTypedComponent<{}, PreferenceData> {
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
    back() {
        this.$router.back();
    }
    async onOk() {
        await this.$store.dispatch("resetConfig", this.$data.config);
        this.$router.back();
    }
}

