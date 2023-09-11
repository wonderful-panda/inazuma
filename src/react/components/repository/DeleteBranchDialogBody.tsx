import { Checkbox, FormControlLabel } from "@mui/material";
import { useMemo, useRef } from "react";
import { DialogBody } from "../DialogBody";
import { DialogActionHandler } from "../Dialog";
import { useDeleteBranch } from "@/hooks/actions/branch";
import { useShowWarning } from "@/state/root";

export const DeleteBranchDialogBody: React.FC<{ branchName: string }> = ({ branchName }) => {
  const deleteBranch = useDeleteBranch();
  const forceRef = useRef<HTMLInputElement>(null);
  const showWarning = useShowWarning();

  const actions = useMemo<DialogActionHandler[]>(
    () => [
      {
        text: "Delete branch",
        color: "primary",
        default: true,
        onClick: async (close: () => void) => {
          if (!branchName) {
            showWarning("Branch name is not specified");
            return;
          }
          const ret = await deleteBranch({ branchName, force: forceRef.current?.checked });
          if (ret && ret !== "failed") {
            close();
          }
        }
      }
    ],
    [showWarning, branchName, deleteBranch]
  );
  return (
    <DialogBody
      title="Delete branch"
      className="w-[40rem]"
      actions={actions}
      defaultActionKey="Enter"
    >
      <>
        <div className="text-xl my-2">{`Delete branch [${branchName}]`}</div>
        <FormControlLabel
          className="ml-2"
          control={<Checkbox inputRef={forceRef} />}
          label="Force delete"
        />
      </>
    </DialogBody>
  );
};
