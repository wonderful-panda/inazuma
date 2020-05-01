import { RenderContext } from "vue";
import { shortHash } from "view/filters";
import * as md from "view/utils/md-classes";
import {
  MdIcon,
  MdDoubleLineList,
  MdSubheader,
  MdListItem,
  MdListItemText
} from "./base/md";
import * as vca from "vue-tsx-support/lib/vca";
import * as emotion from "emotion";
import { ref, computed } from "@vue/composition-api";
import { required } from "./base/prop";
const css = emotion.css;

const getRefName = (b: Ref) => {
  if (b.type === "heads" || b.type === "remotes" || b.type === "tags") {
    return b.name;
  } else {
    return b.fullname;
  }
};

const RefListItem = _fc(
  ({ props }: RenderContext<{ r: Ref; handleClick: () => void }>) => {
    return (
      <MdListItem
        class={style.listItem(props.r.type === "heads" && props.r.current)}
        onClick={props.handleClick}
      >
        <MdListItemText>
          <span class={[md.SUBHEADING, style.branchName]}>
            {getRefName(props.r)}
          </span>
          <span class={[md.CAPTION, style.commitId]}>
            {shortHash(props.r.id)}
          </span>
        </MdListItemText>
      </MdListItem>
    );
  }
);

export default vca.component({
  name: "SideBarBranchList",
  props: {
    title: required(String),
    branches: required<readonly Ref[]>(Array)
  },
  setup(p, ctx: vca.SetupContext<{ onClick: (r: Ref) => void }>) {
    const expanded = ref(true);
    const listStyle = computed(() => ({
      height: `${ListItemHeight * p.branches.length}px`
    }));
    const expandIconStyle = computed(() => ({
      transform: `rotateX(${expanded.value ? 180 : 0}deg)`
    }));
    const toggleExpand = () => {
      expanded.value = !expanded.value;
    };
    const handleItemClick = (r: Ref) => {
      vca.emitOn(ctx, "onClick", r);
    };

    return () => {
      return (
        <div class={style.wrapper}>
          <MdSubheader
            class={["md-primary", style.header]}
            nativeOn-click={toggleExpand}
          >
            <span>{p.title}</span>
            <MdIcon class={style.expandIcon} style={expandIconStyle.value}>
              arrow_drop_down
            </MdIcon>
          </MdSubheader>
          <transition>
            <div
              v-show={expanded.value}
              class={style.container}
              style={listStyle.value}
            >
              <MdDoubleLineList>
                {p.branches.map(r => (
                  <RefListItem
                    key={r.fullname}
                    r={r}
                    handleClick={() => handleItemClick(r)}
                  />
                ))}
              </MdDoubleLineList>
            </div>
          </transition>
        </div>
      );
    };
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
