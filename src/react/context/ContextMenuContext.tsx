import { Icon } from "@iconify/react";
import { ListItemIcon, ListItemText, Menu, MenuItem } from "@material-ui/core";
import { createContext, useCallback, useMemo, useState } from "react";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  handler: () => void;
}

export interface ContextMenuMethods {
  show: (event: React.MouseEvent, menus: ContextMenuItem[]) => void;
}

export const ContextMenuContext = createContext<ContextMenuMethods>({
  show: () => {}
});

interface State {
  top: number;
  left: number;
  menus: ContextMenuItem[];
}

export const ContextMenuProvider: React.FC = ({ children }) => {
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
    if (!state) {
      return [];
    }
    return state.menus.map((m) => {
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
  }, [state?.menus]);
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
