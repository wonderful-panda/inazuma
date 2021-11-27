import { TooltipCommitDisplay, TooltipTitle } from "../TabContainer";

export interface BlameTabTooltipProps {
  commit: Commit;
  path: string;
}

const BlameTabTooltip: React.VFC<BlameTabTooltipProps> = ({ commit, path }) => {
  return (
    <>
      <TooltipTitle text="Blame" />
      <span className="ml-2 font-mono">{path}</span>
      <TooltipCommitDisplay className="ml-4" commit={commit} />
    </>
  );
};

export default BlameTabTooltip;
