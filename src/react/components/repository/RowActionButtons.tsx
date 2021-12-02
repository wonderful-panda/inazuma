import { IconActionItem } from "@/commands/types";
import { IconButton } from "@mui/material";
import { memo, useMemo } from "react";
import { Icon } from "../Icon";

const RowActionButtons_: React.VFC<{
  size: number;
  actions?: readonly IconActionItem[];
}> = ({ size, actions }) => {
  const buttons = useMemo(
    () =>
      (actions || []).map((a) => {
        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (!a.disabled) {
            a.handler();
          }
        };
        return (
          <IconButton
            key={a.id}
            className="p-1 my-auto opacity-75 hover:opacity-100 hover:bg-highlight"
            style={{ maxWidth: size, maxHeight: size }}
            disabled={a.disabled}
            title={a.label}
            onClick={handleClick}
            size="large"
          >
            <Icon icon={a.icon} />
          </IconButton>
        );
      }),
    [size, actions]
  );
  if (!actions) {
    return <></>;
  }
  return (
    <div className="ml-1 mr-2 flex-row-nowrap items-center invisible max-w-0 group-hover:visible group-hover:max-w-none">
      {buttons}
    </div>
  );
};

export const RowActionButtons = memo(RowActionButtons_);
