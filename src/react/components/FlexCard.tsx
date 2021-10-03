import { Card, CardActions, CardContent } from "@material-ui/core";
import { memo } from "react";

export interface FlexCardProps {
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

const FlexCard: React.VFC<FlexCardProps> = ({ content, actions }) => {
  return (
    <Card className="flex-col-nowrap flex-1">
      <CardContent className="flex-col-nowrap flex-1 overflow-y-hidden">{content}</CardContent>
      {actions && <CardActions className="ml-auto">{actions}</CardActions>}
    </Card>
  );
};

export default memo(FlexCard);
