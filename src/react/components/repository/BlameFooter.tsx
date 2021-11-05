import { toLongDate } from "@/date";
import { shortHash } from "@/util";

const className = "flex-row-nowrap flex-grow-0 flex-shrink-0 px-2 h-8 items-center";

const BlameFooter: React.VFC<{ commit?: Commit }> = ({ commit }) => {
  if (!commit) {
    return <div className={className} />;
  }
  return (
    <div className={className}>
      <span className="font-mono text-secondary mr-2 whitespace-nowrap">
        {shortHash(commit.id)}
      </span>
      <span className="font-mono mr-2 whitespace-nowrap">{toLongDate(commit.date)}</span>
      <span className="text-primary mr-2 whitespace-nowrap">{commit.author}</span>
      <span className="mr-2 whitespace-nowrap overflow-hidden">{commit.summary}</span>
    </div>
  );
};

export default BlameFooter;
