import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { dragdrop } from "../dragdrop";
import p from "vue-strict-prop";
import * as emotion from "emotion";
const css = emotion.css;

const Head = tsx.component({
  functional: true,
  render() {
    return <span class={style.head}>HEAD</span>;
  }
});
const Branch = tsx.component({
  props: {
    branch: p.ofObject<BranchRef>().required
  },
  methods: {
    onDragStart(event: DragEvent) {
      event.dataTransfer.effectAllowed = "move";
      dragdrop.setData(event, "git/branch", {
        name: this.branch.name,
        isCurrent: this.branch.current
      });
    }
  },
  render(): VNode {
    return (
      <span
        class={style.branch(this.branch.current)}
        draggable
        onDragstart={this.onDragStart}
      >
        {this.branch.name}
      </span>
    );
  }
});
const Tag = tsx.component({
  functional: true,
  props: { tag: p.ofObject<TagRef>().required },
  render(_h, { props: p }) {
    return <span class={style.tag}>{p.tag.name}</span>;
  }
});
const Remote = tsx.component({
  functional: true,
  props: { remote: p.ofObject<RemoteRef>().required },
  render(_h, { props: p }) {
    return (
      <span class={style.remote}>{p.remote.remote + "/" + p.remote.name}</span>
    );
  }
});

// @vue/component
export default tsx.component({
  name: "LogTableCellSummaryRef",
  functional: true,
  props: {
    refObject: p.ofObject<Ref>().required
  },
  render(_h, { props }): VNode {
    const ref = props.refObject;
    switch (ref.type) {
      case "HEAD":
        return <Head />;
      case "heads":
        return <Branch branch={ref} />;
      case "tags":
        return <Tag tag={ref} />;
      case "remotes":
        return <Remote remote={ref} />;
      default:
        return <span class={baseStyle}>{ref.fullname}</span>;
    }
  }
});

const baseStyle = css`
  vertical-align: middle;
  height: 14px;
  line-height: 14px;
  font-size: 12px;
  margin: auto 4px auto 0;
  padding: 0 0.4em 0 0.4em;
  box-sizing: content-box;
  cursor: default;
`;

const style = {
  head: css`
    ${baseStyle};
    border: 2px solid darkorange;
    border-radius: 2px;
    color: darkorange;
    font-weight: bolder;
  `,
  branch: (current: boolean) => css`
    ${baseStyle};
    border: ${current ? 2 : 1}px solid cyan;
    color: cyan;
    border-radius: 1em;
    cursor: pointer;
  `,
  tag: css`
    ${baseStyle};
    border: 1px solid cyan;
    color: cyan;
  `,
  remote: css`
    ${baseStyle};
    border: 1px solid #888;
    color: #888;
    border-radius: 1em;
  `
};
