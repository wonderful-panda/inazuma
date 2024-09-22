import { TooltipTitle } from "../TabContainer";
import { CommitAttributes } from "./CommitAttributes";

export interface CommitDiffTabTooltipProps {
  commitFrom: Commit | "parent";
  commitTo: Commit;
}

const CommitDiffTabTooltip: React.FC<CommitDiffTabTooltipProps> = ({ commitFrom, commitTo }) => {
  return (
    <>
      <TooltipTitle
        text={commitFrom !== "parent" ? "Commit difference between" : "Commit changes"}
      />
      {commitFrom !== "parent" && (
        <div className="m-1 ml-4 pb-1 border-b border-greytext">
          <CommitAttributes commit={commitFrom} showSummary />
        </div>
      )}
      <div className="m-1 ml-4 pt-1">
        <CommitAttributes commit={commitTo} showSummary />
      </div>
    </>
  );
};

export default CommitDiffTabTooltip;
