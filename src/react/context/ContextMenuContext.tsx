import { ActionItem } from "@/commands/types";
import { Icon } from "@/components/Icon";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { createContext, useCallback, useMemo, useState } from "react";

export interface ContextMenuMethods {
  show: (event: React.MouseEvent | MouseEvent, menus: ActionItem[]) => void;
}

export const ContextMenuContext = createContext<ContextMenuMethods>({
  show: () => {}
});

interface State {
  top: number;
  left: number;
  menus: ActionItem[];
}

export const ContextMenuProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<State | undefined>(undefined);
  const methods = useMemo<ContextMenuMethods>(
    () => ({
      show: (e, menus) => {
        setState(undefined);
        if (menus.length > 0) {
          setTimeout(() => {
            setState({
              left: e.clientX + 2,
              top: e.clientY + 2,
              menus
            });
          }, 0);
        }
      }
    }),
    []
  );
  const handleClose = useCallback(() => setState(undefined), []);
  const menuItems = useMemo(() => {
    return (state?.menus || []).map((m) => {
      const onClick = () => {
        if (m.disabled) {
          return;
        }
        handleClose();
        m.handler();
      };
      return (
        <MenuItem key={m.id} disabled={m.disabled} onClick={onClick}>
          <ListItemIcon className="w-8 min-w-0">{m.icon && <Icon icon={m.icon} />}</ListItemIcon>
          <ListItemText>{m.label}</ListItemText>
        </MenuItem>
      );
    });
  }, [state?.menus, handleClose]);
  return (
    <ContextMenuContext.Provider value={methods}>
      {children}
      <Menu
        open={!!state}
        onClose={handleClose}
        anchorReference="anchorPosition"
        anchorPosition={state ? { left: state.left, top: state.top } : undefined}
      >
        {menuItems}
      </Menu>
    </ContextMenuContext.Provider>
  );
};
