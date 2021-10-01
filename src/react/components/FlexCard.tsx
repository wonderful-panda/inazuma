import { Card, CardActions, CardContent, makeStyles } from "@material-ui/core";
import { memo } from "react";

const useStyles = makeStyles({
  card: {
    display: "flex",
    flexFlow: "column nowrap",
    flex: 1
  },
  cardContent: {
    display: "flex",
    flexFlow: "column nowrap",
    flex: 1,
    overflow: "hidden"
  },
  cardActions: {
    marginLeft: "auto"
  }
});

export interface FlexCardProps {
  content?: React.ReactNode;
  actions?: React.ReactNode;
}

const FlexCard: React.VFC<FlexCardProps> = ({ content, actions }) => {
  const styles = useStyles();
  return (
    <Card className={styles.card}>
      <CardContent className={styles.cardContent}>{content}</CardContent>
      {actions && <CardActions className={styles.cardActions}>{actions}</CardActions>}
    </Card>
  );
};

export default memo(FlexCard);
