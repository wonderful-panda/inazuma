import { addCollection, type IconifyJSON, Icon as IconRaw } from "@iconify/react/offline";
import iconifyJSONs from "@/generated/iconbundle.json";
import type { IconName } from "@/types/IconName";

for (const json of iconifyJSONs as Array<unknown>) {
  addCollection(json as IconifyJSON);
}

export interface IconProps {
  icon: IconName;
  className?: string;
}

export const Icon: React.FC<IconProps> = (props) => <IconRaw {...props} />;
