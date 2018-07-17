import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { shortHash } from "view/filters";
import * as md from "view/utils/md-classes";
import { CssProperties } from "vue-css-definition";

// @vue/component
export default tsx.componentFactoryOf<{ onClick: Ref }>().create({
  name: "SideBarBranchList",
  props: {
    title: p(String).required,
    branches: p.ofRoArray<Ref>().required
  },
  data() {
    return {
      expanded: true
    };
  },
  computed: {
    listStyle(): CssProperties {
      return {
        height: `calc(var(--list-item-height) * ${this.branches.length})`
      };
    },
    expandIconStyle(): CssProperties {
      const deg = this.expanded ? 180 : 0;
      return { transform: `rotateX(${deg}deg)` };
    },
    listItems(): VNode[] {
      return this.branches.map(b => {
        let name: string;
        if (b.type === "heads" || b.type === "remotes" || b.type === "tags") {
          name = b.name;
        } else {
          name = b.fullname;
        }
        const currentBranch = b.type === "heads" && b.current;
        return (
          <md-list-item
            key={b.fullname}
            class={{ [style.currentBranch]: currentBranch }}
            onClick={() => this.$emit("click", b)}
          >
            <div class="md-list-item-text">
              <span class={[md.SUBHEADING, style.branchName]}>{name}</span>
              <span class={[md.CAPTION, style.commitId]}>
                {shortHash(b.id)}
              </span>
            </div>
          </md-list-item>
        );
      });
    }
  },
  methods: {
    toggleExpand() {
      this.expanded = !this.expanded;
    }
  },
  render(): VNode {
    return (
      <div class={style.wrapper}>
        <md-subheader
          class={["md-primary", style.header]}
          nativeOnClick={this.toggleExpand}
        >
          <span>{this.title}</span>
          <md-icon class={style.expandIcon} style={this.expandIconStyle}>
            arrow_drop_down
          </md-icon>
        </md-subheader>
        <transition name={style.transition}>
          <div
            v-show={this.expanded}
            class={style.container}
            style={this.listStyle}
          >
            <md-list class="md-double-line">{this.listItems}</md-list>
          </div>
        </transition>
      </div>
    );
  }
});

const style = css`
  $branchNameHeight: 18px;
  $commitIdHeight: 12px;
  $vPadding: 4px;

  .${"wrapper"} {
    --list-item-height: #{$branchNameHeight + $commitIdHeight + $vPadding * 2};
    padding: 0;
    margin: 0 0 0.5em 0;
    display: flex;
    flex-flow: column nowrap;
    flex: auto 0 0;
  }
  .${"header"} {
    position: relative;
    padding: 2px 2px 2px 4px;
    min-height: 16px;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
    &:hover {
      background-color: #444;
    }
  }
  .${"expandIcon"} {
    position: absolute;
    right: 0;
    font-size: 16px;
    transition: transform ease 0.3s;
  }
  .${"container"} {
    padding: 0;
    margin: 0;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    overflow-y: hidden;
    :global {
      .md-list {
        padding: 0;
        flex: 1;
      }
      .md-list-item-content {
        min-height: var(--list-item-height) !important;
        max-height: var(--list-item-height) !important;
        padding: $vPadding 12px;
      }
    }
  }
  .${"currentBranch"} {
    background-color: #333;
  }
  .${"branchName"} {
    height: $branchNameHeight;
    font-size: 14px;
    text-transform: none !important;
    text-overflow: ellipsis;
  }
  .${"commitId"} {
    height: $commitIdHeight;
    font-size: 12px !important;
    text-transform: none !important;
  }
  .${"transition"} {
    &:global(-enter-active),
    &:global(-leave-active) {
      transition: height 0.2s ease;
    }
    &:global(-enter),
    &:global(-leave-to) {
      height: 0 !important;
    }
  }
`;
