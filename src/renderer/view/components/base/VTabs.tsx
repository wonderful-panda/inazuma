import Vue from "vue";
import * as vca from "vue-tsx-support/lib/vca";
import VButton from "./VButton";
import VIconButton from "./VIconButton";
import { TabDefinition } from "view/mainTypes";
import { css } from "@emotion/css";
import { watch, ref } from "@vue/composition-api";
import { required } from "./prop";

const TabButton = _fc<{
  tab: TabDefinition;
  selected: boolean;
  select: () => void;
  close: () => void;
}>(({ props, data }) => {
  return (
    <div class={style.tab} {...data}>
      <VButton class={style.tabButton(props.selected)} action={props.select}>
        {props.tab.text}
      </VButton>
      <VIconButton
        v-show={props.tab.closable}
        class={style.closeIcon}
        action={props.close}
      >
        close
      </VIconButton>
    </div>
  );
});

interface ScopedSlotArgs {
  default: { tab: TabDefinition };
}

export default vca.component({
  name: "VTabs",
  props: {
    tabs: required<readonly TabDefinition[]>(Array),
    selectedIndex: required(Number),
    closeTab: required<(key: string) => void>(Function)
  },
  setup(p, ctx: vca.SetupContext<{}, ScopedSlotArgs>) {
    const tabButton = ref(null as HTMLDivElement[] | null);
    const update = vca.updateEmitter<typeof p>();
    watch(
      () => p.selectedIndex,
      v => {
        // scroll to selected tab
        Vue.nextTick(() => {
          if (!tabButton.value) {
            return;
          }
          const el = tabButton.value[v];
          el.scrollIntoView({ block: "nearest" });
        });
      }
    );

    const selectTab = (index: number) => {
      update(ctx, "selectedIndex", index);
    };

    return () => {
      const { tabs, closeTab, selectedIndex } = p;
      const renderTab = ctx.slots.default;
      return (
        <div class={style.container}>
          <div class={style.tabbar}>
            {tabs.map((tab, index) => (
              <TabButton
                ref={tabButton}
                refInFor
                key={tab.key}
                tab={tab}
                selected={index === selectedIndex}
                select={() => selectTab(index)}
                close={() => closeTab(tab.key)}
              />
            ))}
          </div>
          {tabs.map((tab, index) => (
            <div
              key={tab.key}
              class={style.tabContent}
              v-show={index === selectedIndex}
            >
              {renderTab({ tab })}
            </div>
          ))}
        </div>
      );
    };
  }
});

const style = {
  container: css`
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    overflow: hidden;
    padding: 0;
  `,
  tabbar: css`
    display: flex;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    flex-flow: row nowrap;
    height: 22px;
    background-color: #333;
    &::-webkit-scrollbar {
      display: none;
      height: 3px;
    }
    &:hover::-webkit-scrollbar {
      display: block;
    }
  `,
  tab: css`
    display: inline-block;
    position: relative;
    height: 22px;
    line-height: 22px;
    border-right: 1px solid #111;
    margin: 0;
  `,
  tabButton: (selected: boolean) => css`
    text-transform: none;
    font-size: small;
    margin: 0;
    height: 22px;
    background-color: ${selected
      ? "var(--md-theme-default-background)"
      : undefined};
    color: ${selected ? "var(--md-theme-default-primary)" : "#aaa"} !important;

    .md-button-content {
      margin-right: auto;
      padding-right: 12px;
    }
  `,
  tabContent: css`
    display: flex;
    flex: 1;
  `,
  closeIcon: css`
    position: absolute;
    right: 0;
    margin: 0;
    padding: 0;
    min-height: 20px;
    max-height: 20px;
    min-width: 20px;
    max-width: 20px;
    .md-icon {
      font-size: x-small !important;
      color: #888 !important;
      &:hover {
        color: #fff !important;
      }
    }
  `
};
