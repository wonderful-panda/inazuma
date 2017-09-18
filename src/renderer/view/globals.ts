import * as tsx from "vue-tsx-support";
import * as m from "vue-tsx-support/lib/modifiers";

global["$tsx"] = tsx;
global["$m"] = m;

declare global {
    interface CompiledTemplate {
        render: any;
        staticRenderFns: any[];
    }

    type TsxComponentAttrs<Props = {}, Events = {}> = tsx.TsxComponentAttrs<Props, Events>;

    let $tsx: typeof tsx;
    let $m: typeof m;
}

