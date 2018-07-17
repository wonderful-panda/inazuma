import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VButton from "./VButton";
import VIconButton from "./VIconButton";
import { TabDefinition } from "view/mainTypes";

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
              action={() => this.$emit("update:selectedIndex", index)}
            >
              {tab.text}
            </VButton>
            <VIconButton
              v-show={tab.closable}
              class={style.closeIcon}
              action={() => this.$emit("tabClose", { tab, index })}
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

const style = css`
  .${"container"} {
    flex: 1;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    overflow: hidden;
    padding: 0;
  }
  .${"tabbar"} {
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
  }
  .${"tab"} {
    display: inline-block;
    position: relative;
    height: 22px;
    line-height: 22px;
    border-right: 1px solid #111;
    margin: 0;
  }
  .${"tabButton"} {
    text-transform: none;
    font-size: small;
    margin: 0;
    height: 22px;
    color: #aaa !important;

    :global(.md-button-content) {
      margin-right: auto;
      padding-right: 12px;
    }
  }
  .${"tabContent"} {
    display: flex;
    flex: 1;
  }
  .${"selectedTabButton"} {
    @extend .${"tabButton"};
    background-color: var(--md-theme-default-background);
    color: var(--md-theme-default-primary) !important;
  }
  .${"closeIcon"} {
    position: absolute;
    right: 0;
    margin: 0;
    padding: 0;
    min-height: 20px;
    max-height: 20px;
    min-width: 20px;
    max-width: 20px;
    :global(.md-icon) {
      font-size: x-small !important;
      color: #888 !important;
      &:hover {
        color: #fff !important;
      }
    }
  }
`;
