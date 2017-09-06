import * as tsx from "vue-tsx-support";
import "vue-tsx-support/options/enable-nativeon";

declare global {
    interface CompiledTemplate {
        render: any;
        staticRenderFns: any[];
    }

    type On<Payload> = {
        [K in keyof Payload]?: (arg: Payload[K]) => void;
    };

    type TsxComponentAttrs<Props extends object = {}, Events = {}> = tsx.TsxComponentAttrs<Props, Events>;

    let $tsx: typeof tsx;
}
