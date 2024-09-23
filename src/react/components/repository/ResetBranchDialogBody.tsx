import {
  AcceptButton,
  CancelButton,
  DialogContent,
  DialogSection,
  DialogTitle,
  LabelledRadio
} from "@/components/Dialog";
import { DialogActions, RadioGroup } from "@mui/material";
import { useRef } from "react";
import { Icon } from "../Icon";
import { CommitAttributes } from "./CommitAttributes";
import classNames from "classnames";
import { useReset } from "@/hooks/actions/reset";
import { useAlert } from "@/context/AlertContext";
import type { ResetMode } from "@backend/ResetMode";
import { invokeTauriCommand } from "@/invokeTauriCommand";
import { useAtomValue } from "jotai";
import { repoPathAtom } from "@/state/repository";
import { useCallbackWithErrorHandler } from "@/hooks/useCallbackWithErrorHandler";

const colors: Record<ResetMode, string> = {
  soft: "bg-success",
  mixed: "bg-info",
  hard: "bg-warning"
};
const ModeRadio: React.FC<{ value: ResetMode; description: string }> = ({ value, description }) => {
  return (
    <LabelledRadio
      value={value}
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
  const alert = useAlert();
  const reset = useReset();
  const repoPath = useAtomValue(repoPathAtom);
  const modeRef = useRef<HTMLDivElement>(null);
  const invokeReset = useCallbackWithErrorHandler(async () => {
    if (!modeRef.current) {
      return false;
    }
    const checkedRadio = [
      ...modeRef.current.querySelectorAll<HTMLInputElement>("input[type='radio']")
    ].find((e) => e.checked);
    if (!checkedRadio) {
      alert.showWarning("No mode selected");
      return false;
    }
    const mode = checkedRadio.value as ResetMode;
    const currentBranch = await invokeTauriCommand("get_current_branch", { repoPath });
    if (currentBranch !== branchName) {
      alert.showError(`"${branchName}" is not current branch`);
      return false;
    }
    return await reset({ commitId: destination.id, mode });
  }, [alert, reset, repoPath, branchName, destination]);

  return (
    <>
      <DialogTitle>Reset current branch to the specified commit</DialogTitle>
      <DialogContent>
        <div className="m-0 flex flex-col-nowrap w-[44rem]">
          <DialogSection label="Current branch">
            <div className="flex-row-nowrap">
              <Icon icon="mdi:source-branch" className="mr-2 my-auto text-2xl" />
              <span>{branchName}</span>
            </div>
          </DialogSection>
          <DialogSection label="Reset to">
            <div className="p-2 border border-greytext">
              <CommitAttributes commit={destination} showSummary />
            </div>
          </DialogSection>
          <DialogSection label="Mode">
            <RadioGroup ref={modeRef} defaultValue="soft">
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
          </DialogSection>
        </div>
      </DialogContent>
      <DialogActions>
        <AcceptButton onClick={invokeReset} default />
        <CancelButton />
      </DialogActions>
    </>
  );
};
