import { IconName } from "@/types/IconName";
import iconifyJSONs from "@/generated/iconbundle.json";
import { Icon as IconRaw, addCollection } from "@iconify/react";

iconifyJSONs.forEach((json: any) => {
  addCollection(json);
});

export interface IconProps {
  icon: IconName;
  className?: string;
}

export const Icon: React.FC<IconProps> = (props) => <IconRaw {...props} />;
