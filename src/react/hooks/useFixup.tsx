import { COMMIT } from "@/store/thunk/commit";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useConfirmDialog } from "./useConfirmDialog";

export const FIXUP_DESC = "Meld staged changes into last commit without changing message";

export const useFixup = () => {
  const dispatch = useDispatch();
  const confirm = useConfirmDialog();
  return useCallback(async () => {
    const ret = await confirm.show({
      title: "Fixup",
      content: <span className="text-xl">{FIXUP_DESC}</span>
    });
    if (ret) {
      dispatch(COMMIT({ type: "amend" }));
    }
  }, [dispatch, confirm]);
};
