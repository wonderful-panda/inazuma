import LogTableCellSummaryRef from "./LogTableCellSummaryRef";
import * as emotion from "emotion";
const css = emotion.css;

const className = css`
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
`;

export default _fc<{ commit: Commit; refs: ReadonlyArray<Ref> }>(ctx => (
  <div class={className} {...ctx.data}>
    {ctx.props.refs.map(r => (
      <LogTableCellSummaryRef key={r.fullname} refObject={r} />
    ))}
    <span key="summary">{ctx.props.commit.summary}</span>
  </div>
));
