import classNames from "classnames";

export type KeyDownTrapperProps = React.PropsWithChildren<{
  onKeyDown: (e: React.KeyboardEvent) => void;
  className?: string;
  tabIndex?: number;
}>;

export const KeyDownTrapper: React.FC<KeyDownTrapperProps> = ({
  onKeyDown,
  className,
  tabIndex = 0,
  children
}) => (
  <div
    role="group"
    className={classNames("flex flex-1 focus:ring-1 focus:ring-secondary", className)}
    tabIndex={tabIndex}
    onKeyDown={onKeyDown}
  >
    {children}
  </div>
);
