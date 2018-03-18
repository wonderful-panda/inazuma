<script lang="tsx">
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { shortHash } from "view/common/filters";
import * as md from "view/common/md-classes";

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
      listStyle(): object {
        if (this.expanded) {
          return {
            height: `calc(var(--list-item-height) * ${this.branches.length})`
          };
        } else {
          return {
            height: 0
          };
        }
      },
      expandIconStyle(): object {
        if (this.expanded) {
          return {
            transform: "rotateX(180deg)"
          };
        } else {
          return {
            transform: "rotateX(0deg)"
          };
        }
      },
      listItems(): VNode[] {
        const s = this.$style;
        return this.branches.map(b => {
          let name: string;
          if (b.type === "heads" || b.type === "remotes" || b.type === "tags") {
            name = b.name;
          } else {
            name = b.fullname;
          }
          return (
            <md-list-item
              key={b.fullname}
              onClick={() => this.$emit("click", b)}
            >
              <div class="md-list-item-text">
                <span class={[md.SUBHEADING, s.branchName]}>{name}</span>
                <span class={[md.CAPTION, s.commitId]}>{shortHash(b.id)}</span>
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
      const s = this.$style;
      return (
        <div class={s.wrapper}>
          <md-subheader
            class={["md-primary", s.header]}
            nativeOnClick={this.toggleExpand}
          >
            <span>{this.title}</span>
            <md-icon class={s.icon} style={this.expandIconStyle}>
              arrow_drop_down
            </md-icon>
          </md-subheader>
          <div class={s.container} style={this.listStyle}>
            <md-list class="md-double-line">{this.listItems}</md-list>
          </div>
        </div>
      );
    }
  },
  ["title", "branches"]
);
</script>

<style lang="scss" module>
$branchNameHeight: 18px;
$commitIdHeight: 12px;
$listItemYPadding: 4px;

.wrapper {
  --list-item-height: $branchNameHeight + $commitIdHeight + $listItemYPadding *
    2;
  padding: 0;
  margin: 0;
  display: flex;
  flex-flow: column nowrap;
  flex: auto 0 0;
}
.header {
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
.icon {
  position: absolute;
  right: 0;
  font-size: 16px;
  transition: transform ease 0.3s;
}
.container {
  padding: 0;
  margin: 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
  overflow-y: hidden;
  margin-bottom: 0.5em;
  transition: height ease 0.1s;
  :global {
    .md-list {
      padding: 0;
      flex: 1;
    }
    .md-list-item-content {
      min-height: var(--list-item-height) !important;
      max-height: var(--list-item-height) !important;
      padding: $listItemYPadding 12px;
    }
  }
}
.branchName {
  height: $branchNameHeight;
  font-size: 14px;
  text-transform: none !important;
  text-overflow: ellipsis;
}
.commitId {
  height: $commitIdHeight;
  font-size: 12px !important;
  text-transform: none !important;
}
</style>
