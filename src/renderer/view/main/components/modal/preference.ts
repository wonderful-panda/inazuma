import Vue from "vue";
import * as typed from "vue-typed-component";

@typed.component<{}>({
    ...<CompiledTemplate>require("./preference.pug"),
    props: {}
})
export class Preference extends typed.StatefulTypedComponent<{}, {}> {
    data() {
        return {};
    }
    back() {
        this.$router.back();
    }
}

