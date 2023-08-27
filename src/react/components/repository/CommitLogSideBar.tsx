import { Collapse, IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { Icon } from "../Icon";
import classNames from "classnames";

const HeaderItem: React.FC<{ text: string; expanded: boolean; onClick: () => void }> = ({
  text,
  expanded,
  onClick
}) => (
  <ListItemButton className="p-1" onClick={onClick}>
    <ListItemText classes={{ primary: "text-xl" }} primary={text} />
    <Icon className="text-2xl mx-1" icon={expanded ? "mdi:chevron-up" : "mdi:chevron-down"} />
  </ListItemButton>
);

const CollapsibleList: React.FC<{ headerText: string; children: React.ReactNode }> = ({
  headerText,
  children
}) => {
  const [open, setOpen] = useState(true);
  const handleHeaderClick = useCallback(() => {
    setOpen(!open);
  }, [open]);
  return (
    <>
      <HeaderItem text={headerText} expanded={open} onClick={handleHeaderClick} />
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List className="w-full pl-2 mb-4" disablePadding>
          {children}
        </List>
      </Collapse>
    </>
  );
};

const SwitchBranchButton: React.FC<{
  r: BranchRef;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}> = ({ r, onClick }) => (
  <IconButton
    size="small"
    edge="end"
    title="Switch to this branch"
    disabled={r.current}
    className={classNames("group-hover:block", {
      "text-secondary": r.current,
      hidden: !r.current
    })}
    data-fullname={r.fullname}
    onClick={onClick}
  >
    <Icon icon="octicon:check-circle-16" />
  </IconButton>
);

const RefListItem: React.FC<{
  r: Ref;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  primaryTextClass?: string;
  secondaryAction?: React.ReactNode;
}> = ({ r, onClick, primaryTextClass, secondaryAction }) => (
  <ListItem className="flex flex-1 group" disablePadding secondaryAction={secondaryAction}>
    <ListItemButton className="px-2 py-1" data-fullname={r.fullname} dense onClick={onClick}>
      <ListItemText
        title={r.name}
        classes={{
          primary: classNames("ellipsis mr-8", primaryTextClass)
        }}
        primary={r.name}
      />
    </ListItemButton>
  </ListItem>
);

export const CommitLogSideBar: React.FC<{
  refs: Refs;
  onItemClick: (r: Ref) => void;
  onSwitchButtonClick: (r: BranchRef) => void;
}> = ({ refs, onItemClick, onSwitchButtonClick }) => {
  const refMap = useMemo(() => {
    const ret = {} as Record<string, Ref>;
    refs.branches.forEach((b) => (ret[b.fullname] = b));
    refs.tags.forEach((t) => (ret[t.fullname] = t));
    return ret;
  }, [refs]);
  const handleListItemClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const fullname = e.currentTarget.dataset.fullname as string;
      if (refMap[fullname]) {
        onItemClick(refMap[fullname]);
      }
    },
    [onItemClick, refMap]
  );
  const handleSwitchButtonClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const fullname = e.currentTarget.dataset.fullname as string;
      const r = refMap[fullname];
      if (r && r.type === "branch") {
        onSwitchButtonClick(r);
      }
    },
    [onSwitchButtonClick, refMap]
  );

  return (
    <div className="mx-2 my-8 w-52">
      <List className="w-full" disablePadding>
        <CollapsibleList headerText="Branches">
          {refs.branches.map((r) => (
            <RefListItem
              key={r.fullname}
              r={r}
              onClick={handleListItemClick}
              primaryTextClass={r.current ? "text-secondary" : ""}
              secondaryAction={<SwitchBranchButton r={r} onClick={handleSwitchButtonClick} />}
            />
          ))}
        </CollapsibleList>
        <CollapsibleList headerText="Tags">
          {refs.tags.map((r) => (
            <RefListItem key={r.fullname} r={r} onClick={handleListItemClick} />
          ))}
        </CollapsibleList>
      </List>
    </div>
  );
};
