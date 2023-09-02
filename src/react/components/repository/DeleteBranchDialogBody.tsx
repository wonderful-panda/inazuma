import { useDispatch } from "@/store";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useMemo, useRef } from "react";
import { DELETE_BRANCH } from "@/store/thunk/branch";
import { DialogBody } from "../DialogBody";
import { DialogActionHandler } from "../Dialog";
import { SHOW_WARNING } from "@/store/misc";

export const DeleteBranchDialogBody: React.FC<{ branchName: string }> = ({ branchName }) => {
  const dispatch = useDispatch();
  const forceRef = useRef<HTMLInputElement>(null);

  const actions = useMemo<DialogActionHandler[]>(
    () => [
      {
        text: "Delete branch",
        color: "primary",
        default: true,
        onClick: async (close: () => void) => {
          if (!branchName) {
            dispatch(SHOW_WARNING("Branch name is not specified"));
            return;
          }
          const ret = await dispatch(
            DELETE_BRANCH({ branchName, force: forceRef.current?.checked })
          );
          if (ret && ret !== "failed") {
            close();
          }
        }
      }
    ],
    [branchName, dispatch]
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
