import { TooltipTitle } from "../TabContainer";
import { CommitAttributes } from "./CommitAttributes";

export interface CommitDiffTabTooltipProps {
  commit1: Commit;
  commit2: Commit;
}

const CommitDiffTabTooltip: React.FC<CommitDiffTabTooltipProps> = ({ commit1, commit2 }) => {
  return (
    <>
      <TooltipTitle text="Commit difference" />
      <div className="m-1 ml-4 pb-1 border-b border-greytext">
        <CommitAttributes commit={commit1} showSummary />
      </div>
      <div className="m-1 ml-4 pt-1">
        <CommitAttributes commit={commit2} showSummary />
      </div>
    </>
  );
};

export default CommitDiffTabTooltip;
