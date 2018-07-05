import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import VButton from "./VButton";
import VIconButton from "./VIconButton";
import { TabDefinition } from "view/mainTypes";
import { functional } from "./functional";

const TabButton = functional<{
  selected: boolean;
  tab: TabDefinition;
  select:() => void;
  close: () => void;
}>({
  render(_, { props: { selected, tab, select, close } }) {
    const className = selected ? style.selectedTabButton : style.tabButton;
    return (
      <div ref="tabButton" refInFor key={tab.key} class={style.tab}>
        <VButton class={className} onClick={select}>
          {tab.text}
        </VButton>
        <VIconButton
          v-show={tab.closable}
          class={style.closeIcon}
          onClick={close}
        >
          close
        </VIconButton>
      </div>
    );
  }
});
export default tsx
  .componentFactoryOf<
    {},
    {
      default: { tab: TabDefinition };
    }
  >()
  .create(
    {
      name: "VTabs",
      props: {
        tabs: p.ofRoArray<TabDefinition>().required,
        selectedIndex: p(Number).required,
        closeTab: p.ofFunction<(index: number) => void>().required
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
              {tabs.map((tab, index) => (
                <TabButton
                  ref="tabButton"
                  refInFor
                  key={tab.key}
                  tab={tab}
                  selected={index === this.selectedIndex}
                  select={() => this.$emit("update:selectedIndex", index)}
                  close={() => this.closeTab(index)}
                />
              ))}
            </div>
            {tabs.map((tab, index) => this.renderTabContent(tab, index))}
          </div>
        );
      }
    },
    ["tabs", "selectedIndex", "closeTab"]
  );

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
