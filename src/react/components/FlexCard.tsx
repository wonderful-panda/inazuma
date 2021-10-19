import { Card, CardActions, CardContent, Typography } from "@material-ui/core";
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
        {title && (
          <Typography
            variant="h5"
            component="div"
            className="border-b border-solid border-current"
            gutterBottom
          >
            {title}
          </Typography>
        )}
        <div className="flex-col-nowrap flex-1 overflow-hidden">{content}</div>
      </CardContent>
      {actions && <CardActions className="ml-auto">{actions}</CardActions>}
    </Card>
  );
};

export default memo(FlexCard);
