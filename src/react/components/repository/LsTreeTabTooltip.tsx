import { TooltipTitle } from "../TabContainer";
import { CommitAttributes } from "./CommitAttributes";

export interface LsTreeTabTooltipProps {
  commit: Commit;
}

const LsTreeTabTooltip: React.FC<LsTreeTabTooltipProps> = ({ commit }) => {
  return (
    <>
      <TooltipTitle text="File tree" />
      <div className="m-1 ml-4">
        <CommitAttributes commit={commit} showSummary />
      </div>
    </>
  );
};

export default LsTreeTabTooltip;
