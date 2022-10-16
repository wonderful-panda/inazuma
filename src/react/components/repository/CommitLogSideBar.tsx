import { Collapse, List, ListItemButton, ListItemText } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { Icon } from "../Icon";

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

const RefListItem: React.FC<{
  r: BranchRef | TagRef;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
}> = ({ r, onClick }) => (
  <ListItemButton className="px-2 py-1" data-fullname={r.fullname} dense onClick={onClick}>
    <ListItemText
      classes={{ primary: r.type === "branch" && r.current ? "text-secondary" : "" }}
      primary={r.name}
    />
  </ListItemButton>
);

export const CommitLogSideBar: React.FC<{
  refs: Refs;
  onItemClick: (r: Ref) => void;
}> = ({ refs, onItemClick }) => {
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

  return (
    <div className="mx-2 my-8 w-48">
      <List className="w-full" disablePadding>
        <CollapsibleList headerText="Branches">
          {refs.branches.map((r) => (
            <RefListItem key={r.fullname} r={r} onClick={handleListItemClick} />
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
