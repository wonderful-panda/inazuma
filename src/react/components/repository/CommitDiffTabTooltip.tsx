import { TooltipCommitDisplay, TooltipTitle } from "../TabContainer";

export interface CommitDiffTabTooltipProps {
  commit1: Commit;
  commit2: Commit;
}

const CommitDiffTabTooltip: React.FC<CommitDiffTabTooltipProps> = ({ commit1, commit2 }) => {
  return (
    <>
      <TooltipTitle text="Commit difference" />
      <TooltipCommitDisplay className="ml-2" commit={commit1} />
      <TooltipCommitDisplay className="ml-2" commit={commit2} />
    </>
  );
};

export default CommitDiffTabTooltip;
