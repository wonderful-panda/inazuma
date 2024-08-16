import { Collapse, IconButton, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import { Icon } from "../Icon";
import classNames from "classnames";
import { useBeginDeleteBranch, useSwitchBranch } from "@/hooks/actions/branch";

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

const BranchActionButtons: React.FC<{
  r: BranchRef;
  switchAction?: (e: React.MouseEvent<HTMLElement>) => void;
  deleteAction?: (e: React.MouseEvent<HTMLElement>) => void;
}> = ({ r, switchAction, deleteAction }) => (
  <div className="flex-row-nowrap">
    <IconButton
      size="small"
      edge="end"
      title="Delete this branch"
      disabled={r.current}
      className={classNames("hidden", { "group-hover:block": !r.current })}
      data-fullname={r.fullname}
      onClick={deleteAction}
    >
      <Icon icon="mdi:delete" />
    </IconButton>
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
      onClick={switchAction}
    >
      <Icon icon="octicon:check-circle-16" />
    </IconButton>
  </div>
);

const RefListItem: React.FC<{
  r: Ref;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  primaryTextClass?: string;
  rowActions?: React.ReactNode;
}> = ({ r, onClick, primaryTextClass, rowActions }) => (
  <ListItem className="flex flex-1 group" disablePadding>
    <ListItemButton className="px-2 py-0" data-fullname={r.fullname} dense onClick={onClick}>
      <ListItemText
        title={r.name}
        classes={{
          primary: "ellipsis mr-2 text-lg " + primaryTextClass
        }}
        primary={r.name}
      />
      {rowActions}
    </ListItemButton>
  </ListItem>
);

export const CommitLogSideBar: React.FC<{
  refs: Refs;
  onItemClick: (r: Ref) => void;
}> = ({ refs, onItemClick }) => {
  const switchBranch = useSwitchBranch();
  const deleteBranch = useBeginDeleteBranch();
  const refMap = useMemo(() => {
    const ret = {} as Record<string, Ref>;
    refs.branches.forEach((b) => (ret[b.fullname] = b));
    refs.tags.forEach((t) => (ret[t.fullname] = t));
    return ret;
  }, [refs]);
  const handleListItemClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const fullname = e.currentTarget.dataset.fullname!;
      if (refMap[fullname]) {
        onItemClick(refMap[fullname]);
      }
    },
    [onItemClick, refMap]
  );
  const switchAction = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const fullname = e.currentTarget.dataset.fullname!;
      const r = refMap[fullname];
      if (r && r.type === "branch") {
        void switchBranch({ branchName: r.name });
      }
    },
    [refMap, switchBranch]
  );

  const deleteAction = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      const fullname = e.currentTarget.dataset.fullname!;
      const r = refMap[fullname];
      if (r && r.type === "branch" && !r.current) {
        void deleteBranch(r.name);
      }
    },
    [refMap, deleteBranch]
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
              rowActions={<BranchActionButtons {...{ r, switchAction, deleteAction }} />}
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
