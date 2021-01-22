import { css } from "@emotion/css";
import { computed, ref } from "@vue/composition-api";
import { px } from "core/utils";
import { __sync } from "view/utils/modifiers";
import Vue from "vue";
import { CssProperties } from "vue-css-definition";
import * as vca from "vue-tsx-support/lib/vca";
import { MdDivider, MdMenu, MdMenuContent, MdMenuItem } from "./base/md";
import { withclass } from "./base/withClass";
import { ContextMenuItem } from "./injection/contextMenu";

const Wrapper = withclass.div(css`
  position: absolute;
  visibility: hidden;
  top: 0;
  left: 0;
`);

const MenuContent = withclass(MdMenuContent)(css`
  max-height: 60vh !important;
`)

const Item = _fc<{ data: ContextMenuItem }>((ctx) => {
  const data = ctx.props.data;
  if (data === "separator") {
    return <MdDivider />;
  } else {
    return (
      <MdMenuItem disabled={data.disabled} onClick={data.action}>
        {data.label}
      </MdMenuItem>
    );
  }
});

export const ContextMenu = vca.component({
  setup() {
    const active = ref(false);
    const data = ref({ x: 0, y: 0, items: [] as readonly ContextMenuItem[] });
    const el = ref<HTMLDivElement | null>(null);
    const show = (e: MouseEvent, items: readonly ContextMenuItem[]) => {
      if (!el.value) {
        return;
      }
      const x = e.pageX - el.value.offsetLeft;
      const y = e.pageY - el.value.offsetTop;
      data.value = { x, y, items };
      active.value = false;
      if (items.length > 0) {
        Vue.nextTick(() => {
          active.value = true;
        });
      }
    };

    const menuStyle = computed(
      () =>
        ({
          position: "absolute",
          left: px(data.value.x),
          top: px(data.value.y)
        } as CssProperties)
    );

    const render_ = () => (
      <Wrapper ref={el}>
        <MdMenu md-active={__sync(active.value)} md-close-on-click style={menuStyle.value}>
          <MenuContent>
            {data.value.items.map((item) => (
              <Item data={item} />
            ))}
          </MenuContent>
        </MdMenu>
      </Wrapper>
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
