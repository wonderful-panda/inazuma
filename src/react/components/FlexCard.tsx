import { Card, CardActions, CardContent } from "@material-ui/core";
import { memo } from "react";

export interface FlexCardProps {
  title?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

const FlexCard: React.VFC<FlexCardProps> = ({ title, content, actions }) => {
  return (
    <Card className="flex-col-nowrap flex-1">
      <CardContent className="flex-col-nowrap flex-1 overflow-y-hidden">
        {title && <div className="border-b mb-1 border-solid border-current text-2xl">{title}</div>}
        <div className="flex-col-nowrap flex-1 overflow-hidden">{content}</div>
      </CardContent>
      {actions && <CardActions className="ml-auto">{actions}</CardActions>}
    </Card>
  );
};

export default memo(FlexCard);
