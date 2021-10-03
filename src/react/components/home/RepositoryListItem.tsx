import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText
} from "@material-ui/core";
import { useCallback } from "react";

export interface RepositoryListItemProps {
  itemId: string;
  icon: React.ReactNode;
  primary: string;
  secondary: string | React.ReactNode;
  action: (itemId: string) => void;
  secondaryAction?: {
    icon: React.ReactNode;
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
  const onSecondaryActionClick = secondaryAction
    ? useCallback(() => secondaryAction?.action(itemId), [secondaryAction, itemId])
    : undefined;
  return (
    <div className="group">
      <ListItem className="p-0" button dense onClick={onClick}>
        <ListItemIcon className="ml-2">{icon}</ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ className: "text-xl" }}
          secondaryTypographyProps={{ className: "text-greytext" }}
          primary={primary}
          secondary={secondary}
        />
        {secondaryAction && (
          <ListItemSecondaryAction
            className="opacity-0 group-hover:opacity-100 duration-75"
            onClick={onSecondaryActionClick}
          >
            <IconButton edge="end">{secondaryAction.icon}</IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    </div>
  );
};
