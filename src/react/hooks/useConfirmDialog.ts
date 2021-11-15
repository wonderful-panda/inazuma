import { useContext } from "react";
import { ConfirmDialogContext } from "@/context/ConfirmDialogContext";

export const useConfirmDialog = () => useContext(ConfirmDialogContext);
