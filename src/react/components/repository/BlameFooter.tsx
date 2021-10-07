import { toLongDate } from "@/date";
import { shortHash } from "@/util";

const className = "flex-row-nowrap flex-grow-0 flex-shrink-0 px-2 h-[32px] leading-[32px]";

const BlameFooter: React.VFC<{ commit?: Commit }> = ({ commit }) => {
  if (!commit) {
    return <div className={className} />;
  }
  return (
    <div className={className}>
      <span className="font-mono text-secondary mr-2">{shortHash(commit.id)}</span>
      <span className="font-mono mr-2">{toLongDate(commit.date)}</span>
      <span className="text-primary mr-2">{commit.author}</span>
      <span className="mr-2">{commit.summary}</span>
    </div>
  );
};

export default BlameFooter;
