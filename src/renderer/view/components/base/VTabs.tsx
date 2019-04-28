import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VButton from "./VButton";
import VIconButton from "./VIconButton";
import { TabDefinition } from "view/mainTypes";
import * as emotion from "emotion";
const css = emotion.css;

const TabButton = tsx.component({
  functional: true,
  props: {
    tab: p.ofObject<TabDefinition>().required,
    selected: p(Boolean).required,
    select: p.ofFunction<() => void>().required,
    close: p.ofFunction<() => void>().required
  },
  render(_h, { props, data }): VNode {
    const { tab, selected, select, close } = props;
    return (
      <div class={style.tab} {...data}>
        <VButton class={style.tabButton(selected)} action={select}>
          {tab.text}
        </VButton>
        <VIconButton
          v-show={tab.closable}
          class={style.closeIcon}
          action={close}
        >
          close
        </VIconButton>
      </div>
    );
  }
});

interface ScopedSlotArgs {
  default: { tab: TabDefinition };
}
export default tsx.componentFactoryOf<{}, ScopedSlotArgs>().create({
  name: "VTabs",
  props: {
    tabs: p.ofRoArray<TabDefinition>().required,
    selectedIndex: p(Number).required,
    closeTab: p.ofFunction<(key: string) => void>().required
  },
  watch: {
    selectedIndex(value: number) {
      this.$nextTick(() => {
        const tabButton = (this.$refs.tabButton as HTMLDivElement[])[value];
        tabButton.scrollIntoView({ block: "nearest" });
      });
    }
  },
  methods: {
    selectTab(index: number) {
      this.$emit("update:selectedIndex", index);
    }
  },
  render(): VNode {
    const { tabs } = this;
    const renderTab = this.$scopedSlots.default;
    return (
      <div class={style.container}>
        <div class={style.tabbar}>
          {tabs.map((tab, index) => (
            <TabButton
              ref="tabButton"
              refInFor
              key={tab.key}
              tab={tab}
              selected={index === this.selectedIndex}
              select={() => this.selectTab(index)}
              close={() => this.closeTab(tab.key)}
            />
          ))}
        </div>
        {tabs.map((tab, index) => (
          <div
            key={tab.key}
            class={style.tabContent}
            v-show={index === this.selectedIndex}
          >
            {renderTab({ tab })}
          </div>
        ))}
      </div>
    );
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
