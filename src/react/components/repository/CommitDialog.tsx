import { useDispatch } from "@/store";
import { clamp } from "@/util";
import { TextField } from "@material-ui/core";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from "react";
import { Dialog, DialogActionHandler, DialogMethods } from "../Dialog";
import { COMMIT } from "@/store/thunk/commit";
import { RELOAD_REPOSITORY } from "@/store/thunk/reloadRepository";
import { SHOW_ALERT } from "@/store/misc";

const CommitDialog: React.ForwardRefRenderFunction<DialogMethods> = (_, ref) => {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [opened, setOpened] = useState(false);
  const [rows, setRows] = useState(6);
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRows(clamp(e.target.value.split(/\n/g).length, 6, 24));
  }, []);
  useImperativeHandle(ref, () => ({
    open: () => setOpened(true),
    close: () => setOpened(false)
  }));
  useEffect(() => {
    if (opened) {
      setRows(6);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [opened]);
  const invokeCommit = useCallback(async () => {
    const message = inputRef.current?.value || "";
    if (!message) {
      dispatch(SHOW_ALERT({ type: "warning", message: "Input commit message" }));
      return;
    }
    await dispatch(COMMIT(message));
    await dispatch(RELOAD_REPOSITORY());
    setOpened(false);
  }, [dispatch]);
  const actions = useMemo<DialogActionHandler[]>(
    () => [
      {
        text: "Commit",
        color: "primary",
        default: true,
        onClick: invokeCommit
      }
    ],
    [invokeCommit]
  );
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation();
      console.log(e);
      if (e.ctrlKey && e.code === "Enter") {
        invokeCommit();
      }
    },
    [invokeCommit]
  );
  return (
    <Dialog
      className="w-[60rem] max-w-none"
      title="Commit"
      isOpened={opened}
      setOpened={setOpened}
      actions={actions}
    >
      <TextField
        inputRef={inputRef}
        className="h-auto w-full"
        rows={rows}
        variant="outlined"
        multiline
        label="Commit message"
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
    </Dialog>
  );
};

export default forwardRef(CommitDialog);
