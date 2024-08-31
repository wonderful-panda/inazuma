import { AcceptButton, CancelButton, DialogContent, DialogTitle } from "@/components/Dialog";
import { DialogActions, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useCallback, useRef } from "react";
import { Icon } from "../Icon";
import { CommitAttributes } from "./CommitAttributes";
import classNames from "classnames";
import { useReset } from "@/hooks/actions/reset";

type SwitchMode = "soft" | "mixed" | "hard";
const colors: Record<SwitchMode, string> = {
  soft: "bg-success",
  mixed: "bg-info",
  hard: "bg-warning"
};
const ModeRadio: React.FC<{ value: SwitchMode; description: string }> = ({
  value,
  description
}) => {
  return (
    <FormControlLabel
      className="h-8"
      value={value}
      control={<Radio tabIndex={0} />}
      label={
        <div className="flex-row-nowrap">
          <span
            className={classNames("capitalize mr-2 w-16 text-center rounded-md", colors[value])}
          >
            {value}
          </span>
          {description}
        </div>
      }
    />
  );
};

export const ResetDialogBody: React.FC<{ branchName: string; destination: Commit }> = ({
  branchName,
  destination
}) => {
  const reset = useReset();
  const modeRef = useRef<HTMLDivElement>(null);
  const invokeReset = useCallback(async () => {
    if (!modeRef.current) {
      return false;
    }
    const mode = [
      ...modeRef.current.querySelectorAll<HTMLInputElement>("input[type='radio']")
    ].find((e) => e.checked)?.value;
    console.log("mode:", mode);
    return await reset();
  }, [reset]);

  return (
    <>
      <DialogTitle>Reset current branch to the specified commit</DialogTitle>
      <DialogContent>
        <div className="m-0 flex flex-col-nowrap w-[44rem]">
          <div className="text-primary">Current branch</div>
          <div className="ml-6 mb-2 px-2 flex-row-nowrap">
            <Icon icon="octicon:git-branch-16" className="mr-2 my-auto" />
            <span>{branchName}</span>
          </div>
          <div className="text-primary">Reset to</div>
          <div className="ml-6 mb-3 px-2 border border-greytext">
            <CommitAttributes commit={destination} showSummary />
          </div>
          <div className="text-primary">Mode</div>
          <RadioGroup ref={modeRef} className="ml-6" defaultValue="soft">
            <ModeRadio
              value="soft"
              description="Don't touch the index or the working tree at all"
            />
            <ModeRadio
              value="mixed"
              description="Reset the index, and don't touch the working tree"
            />
            <ModeRadio
              value="hard"
              description="Discard all changes including the index and the working tree"
            />
          </RadioGroup>
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeReset} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
