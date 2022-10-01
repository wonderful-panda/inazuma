import { COMMIT } from "@/store/thunk/commit";
import { useCallback } from "react";
import { useDispatch } from "@/store";
import { SHOW_CONFIRM_DIALOG } from "@/store/thunk/confirmDialog";

export const FIXUP_DESC = "Meld staged changes into last commit without changing message";

export const useFixup = () => {
  const dispatch = useDispatch();
  return useCallback(async () => {
    const ret = await dispatch(
      SHOW_CONFIRM_DIALOG({
        title: "Fixup",
        content: FIXUP_DESC
      })
    );
    if (ret) {
      dispatch(COMMIT({ commitType: "amend" }));
    }
  }, [dispatch]);
};
