import { TooltipCommitDisplay, TooltipTitle } from "../TabContainer";

export interface LsTreeTabTooltipProps {
  commit: Commit;
}

const LsTreeTabTooltip: React.FC<LsTreeTabTooltipProps> = ({ commit }) => {
  return (
    <>
      <TooltipTitle text="File tree" />
      <TooltipCommitDisplay className="ml-2" commit={commit} />
    </>
  );
};

export default LsTreeTabTooltip;
