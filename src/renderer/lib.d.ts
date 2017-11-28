///<reference path="../commonTypes.d.ts" />
///<reference path="../ipc-promise.d.ts" />
///<reference path="./vue-material.d.ts" />

import "vue-tsx-support/enable-check";

declare global {
    export interface CompiledTemplate {
        render: any;
        staticRenderFns: any[];
    }
}

