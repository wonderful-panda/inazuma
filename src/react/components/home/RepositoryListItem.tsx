import { Icon } from "@iconify/react";
import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText
} from "@material-ui/core";
import { useCallback, useMemo } from "react";

export interface RepositoryListItemProps {
  itemId: string;
  icon: string;
  primary: string;
  secondary: string | React.ReactNode;
  action: (itemId: string) => void;
  secondaryAction?: {
    icon: string;
    action: (itemId: string) => void;
  };
}

export const RepositoryListItem: React.VFC<RepositoryListItemProps> = ({
  itemId,
  icon,
  action,
  primary,
  secondary,
  secondaryAction
}) => {
  const onClick = useCallback(() => action(itemId), [action, itemId]);
  const onSecondaryActionClick = useMemo(() => {
    if (secondaryAction) {
      return () => secondaryAction?.action(itemId);
    } else {
      return undefined;
    }
  }, [secondaryAction, itemId]);
  return (
    <div className="group">
      <ListItem className="p-0" button dense onClick={onClick}>
        <ListItemIcon className="ml-2 text-2xl">
          <Icon icon={icon} />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ className: "text-xl" }}
          secondaryTypographyProps={{ className: "text-greytext" }}
          primary={primary}
          secondary={secondary}
        />
        {secondaryAction && (
          <ListItemSecondaryAction
            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 duration-75"
            onClick={onSecondaryActionClick}
          >
            <IconButton className="text-2xl" edge="end">
              <Icon icon={secondaryAction.icon} />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </div>
  );
};
