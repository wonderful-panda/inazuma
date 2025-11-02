import type { IconActionItem } from "@/commands/types";
import { IconButton } from "@mui/material";
import classNames from "classnames";
import { memo, useMemo } from "react";
import { Icon } from "../Icon";

export interface RowActionItem extends IconActionItem {
  alwaysVisible?: boolean;
  className?: string;
}

const RowActionButtons_: React.FC<{
  size: number;
  actions?: readonly RowActionItem[];
}> = ({ size, actions }) => {
  const buttons = useMemo(
    () =>
      (actions ?? []).map((a) => {
        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (!a.disabled) {
            a.handler();
          }
        };
        return (
          <IconButton
            key={a.id}
            className={classNames(
              "p-1 my-auto hover:bg-highlight",
              !a.alwaysVisible && "hidden group-hover:flex opacity-75 hover:opacity-100",
              a.className
            )}
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
    return null;
  }
  return <div className="ml-1 mr-2 flex-row-nowrap items-center">{buttons}</div>;
};

export const RowActionButtons = memo(RowActionButtons_);
