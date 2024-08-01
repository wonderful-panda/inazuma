import { TooltipTitle } from "../TabContainer";
import { CommitAttributes } from "./CommitAttributes";

export interface BlameTabTooltipProps {
  commit: Commit;
  path: string;
}

const BlameTabTooltip: React.FC<BlameTabTooltipProps> = ({ commit, path }) => {
  return (
    <>
      <TooltipTitle text="Blame" />
      <span className="m-1 ml-4 border-b border-greytext font-mono">{path}</span>
      <div className="m-1 ml-4">
        <CommitAttributes commit={commit} showSummary />
      </div>
    </>
  );
};

export default BlameTabTooltip;
