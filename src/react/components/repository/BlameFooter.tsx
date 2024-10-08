import { formatDate } from "@/date";
import { shortHash } from "@/util";

const className = "flex-row-nowrap flex-none px-2 h-8 items-center";

export const BlameFooter: React.FC<{ commit?: Commit }> = ({ commit }) => {
  if (!commit) {
    return <div className={className} />;
  }
  return (
    <div className={className}>
      <span className="font-mono text-secondary mr-2 whitespace-nowrap">
        {shortHash(commit.id)}
      </span>
      <span className="font-mono mr-2 whitespace-nowrap">{formatDate(commit.date)}</span>
      <span className="text-primary mr-2 whitespace-nowrap">{commit.author}</span>
      <span className="mr-2 whitespace-nowrap overflow-hidden">{commit.summary}</span>
    </div>
  );
};
