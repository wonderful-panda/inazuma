import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { shortHash } from "view/filters";
import * as md from "view/utils/md-classes";
import { CssProperties } from "vue-css-definition";
import * as style from "./SideBarBranchList.scss";

export default tsx.componentFactoryOf<{ onClick: Ref }>().create(
  // @vue/component
  {
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
  },
  ["title", "branches"]
);
