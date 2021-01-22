import Vue from "vue";
import { computed, ref } from "@vue/composition-api";
import { px } from "core/utils";
import { __sync } from "view/utils/modifiers";
import { CssProperties } from "vue-css-definition";
import * as vca from "vue-tsx-support/lib/vca";

export const ContextMenu = vca.component({
  setup() {
    const active = ref(false);
    const pos = ref({ x: 0, y: 0 });
    const el = ref<HTMLDivElement | null>(null);
    const show = (e: MouseEvent, _items: any[]) => {
      if (!el.value) {
        return;
      }
      console.log(e.pageX, e.pageY);
      console.log(el.value.offsetLeft, el.value.offsetTop);
      const x = e.pageX - el.value.offsetLeft;
      const y = e.pageY - el.value.offsetTop;
      pos.value = { x, y };
      active.value = false;
      Vue.nextTick(() => {
        active.value = true;
      });
    };
    const wrapperStyle = {
      position: "absolute",
      visibility: "hidden",
      top: 0,
      left: 0
    } as CssProperties;

    const menuStyle = computed(
      () =>
        ({
          position: "absolute",
          left: px(pos.value.x),
          top: px(pos.value.y)
        } as CssProperties)
    );

    const render_ = () => (
      <div ref={el} style={wrapperStyle}>
        <md-menu md-active={__sync(active.value)} style={menuStyle.value}>
          <md-menu-content>
            <md-menu-item>Item 1</md-menu-item>
            <md-menu-item>Item 2</md-menu-item>
            <md-menu-item>Item 3</md-menu-item>
          </md-menu-content>
        </md-menu>
      </div>
    );
    return {
      show,
      render_
    };
  },
  render() {
    return this.render_();
  }
});
