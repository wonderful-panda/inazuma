import { Card, CardActions, CardContent } from "@mui/material";
import { memo } from "react";

export interface FlexCardProps {
  title?: React.ReactNode;
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

const FlexCard_: React.FC<FlexCardProps> = ({ title, content, actions }) => {
  return (
    <Card className="flex-col-nowrap flex-1">
      <CardContent className="flex-col-nowrap flex-1 overflow-y-hidden p-j4">
        {title && (
          <div className="flex-row-nowrap border-b mb-1 border-current text-xl font-bold">
            {title}
          </div>
        )}
        <div className="flex-col-nowrap flex-1 overflow-hidden">{content}</div>
      </CardContent>
      {actions && <CardActions className="ml-auto pt-0 pr-4">{actions}</CardActions>}
    </Card>
  );
};

export const FlexCard = memo(FlexCard_);
