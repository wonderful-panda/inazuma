import { dragdrop } from "../dragdrop";
import * as emotion from "emotion";
const css = emotion.css;

const Head = _fc(() => <span class={style.head}>HEAD</span>);

const Branch = _fc<{ branch: BranchRef }>(ctx => {
  const branch = ctx.props.branch;
  const onDragStart = (e: DragEvent) => {
    if (!e.dataTransfer) {
      return;
    }
    e.dataTransfer.effectAllowed = "move";
    dragdrop.setData(e, "git/branch", {
      name: branch.name,
      isCurrent: branch.current
    });
  };
  return (
    <span
      class={style.branch(branch.current)}
      draggable
      onDragstart={onDragStart}
    >
      {branch.name}
    </span>
  );
});

const Tag = _fc<{ tag: TagRef }>(({ props: { tag } }) => (
  <span class={style.tag}>{tag.name}</span>
));

const Remote = _fc<{ remote: RemoteRef }>(({ props: { remote } }) => (
  <span class={style.remote}>{remote.remote + "/" + remote.name}</span>
));

export default _fc<{ refObject: Ref }>(({ props }) => {
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
