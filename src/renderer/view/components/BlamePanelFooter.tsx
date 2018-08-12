import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";
import { shortHash, longDate } from "../filters";
import * as emotion from "emotion";
const css = emotion.css;

export default tsx.component({
  name: "BlamePanelFooter",
  functional: true,
  props: {
    commit: p.ofObject<FileCommit>().optional
  },
  render(_h, { props }): VNode {
    const commit = props.commit;
    if (!commit) {
      return <div class={style.container} />;
    } else {
      return (
        <div class={style.container}>
          <span class={style.sha}>{shortHash(commit.id)}</span>
          <span class={style.date}>{longDate(commit.date)}</span>
          <span class={style.author}>{commit.author}</span>
          <span class={style.summary}>{commit.summary}</span>
        </div>
      );
    }
  }
});

const style = {
  container: css`
    min-height: 20px;
    height: 20px;
    line-height: 20px;
    flex: 0;
    display: flex;
  `,
  sha: css`
    color: var(--md-theme-default-accent);
    font-family: var(--monospace-fontfamily);
    margin-right: 8px;
  `,
  date: css`
    font-family: var(--monospace-fontfamily);
    margin-right: 8px;
  `,
  author: css`
    color: var(--md-theme-default-primary);
    margin-right: 8px;
  `,
  summary: css`
    margin-right: 8px;
  `
};
