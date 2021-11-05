import { IconName } from "@/__IconName";
import iconifyJSONs from "@/__iconbundle.json";
import { Icon as IconRaw, addCollection } from "@iconify/react";

iconifyJSONs.forEach((json: any) => {
  addCollection(json);
});

export interface IconProps {
  icon: IconName;
  className?: string;
}

export const Icon: React.VFC<IconProps> = (props) => <IconRaw {...props} />;
