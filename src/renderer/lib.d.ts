import "vue-tsx-support/enable-check";
import { _TsxComponentV3 } from "vue-tsx-support";
import { RenderContext, VNode } from "vue";

declare global {
  function _fc<P>(_func: (ctx: RenderContext<P>) => VNode): _TsxComponentV3<Vue, P, {}, {}, {}, {}>;
}
