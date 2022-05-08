import classNames from "classnames";
import { assertNever } from "@/util";

const Badge: React.FC<{ className?: string }> = ({ className, children }) => (
  <span
    className={classNames(
      "align-middle h-4 leading-4 text-sm mr-1 my-auto px-2 box-content whitespace-nowrap cursor-default bg-background",
      className
    )}
  >
    {children}
  </span>
);

const Branch: React.VFC<{ r: BranchRef }> = ({ r }) => (
  <Badge
    className={classNames(
      "rounded-xl",
      r.current
        ? "text-secondary border-2 border-solid border-current"
        : "text-[cyan] border border-solid border-current"
    )}
  >
    {r.name}
  </Badge>
);

const Tag: React.VFC<{ r: TagRef }> = ({ r }) => (
  <Badge className="text-[cyan] border border-solid border-current">{r.name}</Badge>
);

const Remote: React.VFC<{ r: RemoteRef }> = ({ r }) => (
  <Badge className="text-[grey] border border-solid border-current rounded-xl">{`${r.remote}/${r.name}`}</Badge>
);

export const RefBadge: React.VFC<{ r: Ref }> = ({ r }) => {
  switch (r.type) {
    case "branch":
      return <Branch r={r} />;
    case "tag":
      return <Tag r={r} />;
    case "remote":
      return <Remote r={r} />;
    default:
      return assertNever(r);
  }
};
