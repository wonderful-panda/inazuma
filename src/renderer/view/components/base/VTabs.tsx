import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VButton from "./VButton";
import VIconButton from "./VIconButton";
import { TabDefinition } from "view/mainTypes";
import * as style from "./VTabs.scss";

export default tsx
  .componentFactoryOf<
    {
      onTabClose: { tab: TabDefinition; index: number };
    },
    {
      default: { tab: TabDefinition };
    }
  >()
  .create({
    name: "VTabs",
    props: {
      tabs: p.ofRoArray<TabDefinition>().required,
      selectedIndex: p(Number).required
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
      renderTabButton(tab: TabDefinition, index: number): VNode {
        const className =
          index === this.selectedIndex
            ? style.selectedTabButton
            : style.tabButton;
        return (
          <div ref="tabButton" refInFor key={tab.key} class={style.tab}>
            <VButton
              class={className}
              onClick={() => this.$emit("update:selectedIndex", index)}
            >
              {tab.text}
            </VButton>
            <VIconButton
              v-show={tab.closable}
              class={style.closeIcon}
              onClick={() => this.$emit("tabClose", { tab, index })}
            >
              close
            </VIconButton>
          </div>
        );
      },
      renderTabContent(tab: TabDefinition, index: number): VNode {
        return (
          <div
            v-show={index === this.selectedIndex}
            key={tab.key}
            class={style.tabContent}
          >
            {this.$scopedSlots.default({ tab })}
          </div>
        );
      }
    },
    render(): VNode {
      const { tabs } = this;
      return (
        <div class={style.container}>
          <div class={style.tabbar}>
            {tabs.map((tab, index) => this.renderTabButton(tab, index))}
          </div>
          {tabs.map((tab, index) => this.renderTabContent(tab, index))}
        </div>
      );
    }
  });
