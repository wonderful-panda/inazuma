import classNames from "classnames";
import React from "react";

export interface KeyDownTrapperProps extends ChildrenProp {
  onKeyDown: (e: React.KeyboardEvent) => void;
  className?: string;
  tabIndex?: number;
}

export const KeyDownTrapper: React.FC<KeyDownTrapperProps> = ({
  onKeyDown,
  className,
  tabIndex = 0,
  children
}) => (
  <div
    className={classNames("flex flex-1 focus:ring-1 focus:ring-secondary", className)}
    tabIndex={tabIndex}
    onKeyDown={onKeyDown}
  >
    {children}
  </div>
);
