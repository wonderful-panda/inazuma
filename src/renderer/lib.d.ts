import "vue-tsx-support/enable-check";

declare global {
  export interface CompiledTemplate {
    render: any;
    staticRenderFns: any[];
  }
}
