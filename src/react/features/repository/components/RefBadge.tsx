import classNames from "classnames";
import { useCallback } from "react";
import { setDragData } from "@/dragdrop";
import { assertNever } from "@/util";

const Badge: React.FC<
  React.PropsWithChildren<{
    className?: string;
    draggable?: boolean;
    onDragStart?: (e: React.DragEvent) => void;
  }>
> = ({ className, draggable, onDragStart, children }) => (
  <span
    role={draggable ? "button" : undefined}
    className={classNames(
      "align-middle h-4 leading-4 text-sm mr-1 my-auto px-2 box-content whitespace-nowrap cursor-default bg-background",
      draggable && "cursor-move",
      className
    )}
    draggable={draggable || undefined}
    onDragStart={draggable ? onDragStart : undefined}
  >
    {children}
  </span>
);

const Branch: React.FC<{ r: BranchRef }> = ({ r }) => {
  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      setDragData(e, "git/branch", { name: r.name, current: r.current });
    },
    [r]
  );
  return (
    <Badge
      className={classNames(
        "rounded-xl",
        r.current ? "text-secondary border-2 border-current" : "text-[cyan] border border-current"
      )}
      draggable
      onDragStart={handleDragStart}
    >
      {r.name}
    </Badge>
  );
};

const Tag: React.FC<{ r: TagRef }> = ({ r }) => (
  <Badge className="text-[cyan] border border-current">{r.name}</Badge>
);

const Remote: React.FC<{ r: RemoteRef }> = ({ r }) => (
  <Badge className="text-[grey] border border-current rounded-xl">{`${r.remote}/${r.name}`}</Badge>
);

const Reflog: React.FC<{ r: ReflogRef }> = ({ r }) => (
  <Badge className="text-[grey] border border-current">{r.name}</Badge>
);

export const RefBadge: React.FC<{ r: Ref }> = ({ r }) => {
  switch (r.type) {
    case "branch":
      return <Branch r={r} />;
    case "tag":
      return <Tag r={r} />;
    case "remote":
      return <Remote r={r} />;
    case "reflog":
      return <Reflog r={r} />;
    default:
      return assertNever(r);
  }
};
