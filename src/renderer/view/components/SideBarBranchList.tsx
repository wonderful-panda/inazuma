import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { shortHash } from "view/filters";
import * as md from "view/utils/md-classes";
import { CssProperties } from "vue-css-definition";
import {
  MdIcon,
  MdDoubleLineList,
  MdSubheader,
  MdListItem,
  MdListItemText
} from "./base/md";
import * as emotion from "emotion";
const css = emotion.css;

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
        height: `${ListItemHeight * this.branches.length}px`
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
          <MdListItem
            key={b.fullname}
            class={style.listItem(currentBranch)}
            onClick={() => this.$emit("click", b)}
          >
            <MdListItemText>
              <span class={[md.SUBHEADING, style.branchName]}>{name}</span>
              <span class={[md.CAPTION, style.commitId]}>
                {shortHash(b.id)}
              </span>
            </MdListItemText>
          </MdListItem>
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
        <MdSubheader
          class={["md-primary", style.header]}
          nativeOn-click={this.toggleExpand}
        >
          <span>{this.title}</span>
          <MdIcon class={style.expandIcon} style={this.expandIconStyle}>
            arrow_drop_down
          </MdIcon>
        </MdSubheader>
        <transition>
          <div
            v-show={this.expanded}
            class={style.container}
            style={this.listStyle}
          >
            <MdDoubleLineList>{this.listItems}</MdDoubleLineList>
          </div>
        </transition>
      </div>
    );
  }
});

const BranchNameHeight = 18;
const CommitIdHeight = 12;
const VPadding = 4;
const ListItemHeight = BranchNameHeight + CommitIdHeight + VPadding * 2;
const style = {
  wrapper: css`
    padding: 0;
    margin: 0 0 0.5em 0;
    display: flex;
    flex-flow: column nowrap;
    flex: auto 0 0;
  `,
  header: css`
    position: relative;
    padding: 2px 2px 2px 4px;
    min-height: 16px;
    font-size: 16px;
    cursor: pointer;
    user-select: none;
    &:hover {
      background-color: #444;
    }
  `,
  expandIcon: css`
    position: absolute;
    right: 0;
    font-size: 16px;
    transition: transform ease 0.3s;
  `,
  container: css`
    padding: 0;
    margin: 0;
    display: flex;
    flex-flow: column nowrap;
    align-items: stretch;
    overflow-y: hidden;
    .md-list {
      padding: 0;
      flex: 1;
    }
    &.v-enter-active,
    &.v-leave-active {
      transition: height 0.2s ease;
    }
    &.v-enter,
    &.v-leave-to {
      height: 0 !important;
    }
  `,
  listItem: (isCurrent: boolean) => css`
    .md-list-item-content {
      min-height: ${ListItemHeight}px !important;
      max-height: ${ListItemHeight}px !important;
      padding: ${VPadding}px 12px;
    }
    background-color: ${isCurrent ? "#333" : undefined};
  `,
  branchName: css`
    height: ${BranchNameHeight}px;
    font-size: 14px !important;
    text-transform: none !important;
    text-overflow: ellipsis;
  `,
  commitId: css`
    height: ${CommitIdHeight}px;
    font-size: 12px !important;
    text-transform: none !important;
  `
};
