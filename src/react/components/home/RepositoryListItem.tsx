import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  withStyles
} from "@material-ui/core";
import { useCallback } from "react";
import styled from "styled-components";

export interface RepositoryListItemProps {
  itemId: string;
  icon: React.ReactNode;
  primary: string;
  secondary: string;
  action: (itemId: string) => void;
  secondaryAction?: {
    icon: React.ReactNode;
    action: (itemId: string) => void;
  };
}

const StyledSecondaryAction = styled(ListItemSecondaryAction)`
  opacity: 0;
  &:hover {
    opacity: 1;
  }
`;

const StyledListItem = styled(ListItem)`
  &:hover + ${StyledSecondaryAction} {
    opacity: 1;
  }
`;

const StyledListItemText = withStyles({
  primary: {
    fontSize: "1.1rem"
  },
  secondary: {
    color: "#808080"
  }
})(ListItemText);

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
    <StyledListItem button dense onClick={onClick}>
      <ListItemIcon>{icon}</ListItemIcon>
      <StyledListItemText primary={primary} secondary={secondary} />
      {secondaryAction && (
        <StyledSecondaryAction className="__test__" onClick={onSecondaryActionClick}>
          <IconButton edge="end">{secondaryAction.icon}</IconButton>
        </StyledSecondaryAction>
      )}
    </StyledListItem>
  );
};
