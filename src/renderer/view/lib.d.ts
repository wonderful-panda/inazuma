import * as tsx from "vue-tsx-support";

declare global {
    interface CompiledTemplate {
        render: any;
        staticRenderFns: any[];
    }

    type On<Payload> = {
        [K in keyof Payload]?: (arg: Payload[K]) => void;
    };

    type TsxComponentAttrs<Props = {}, Events = {}> = tsx.TsxComponentAttrs;

    let $tsx: typeof tsx;
}
