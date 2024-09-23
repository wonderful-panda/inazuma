import type { IconName } from "@/types/IconName";
import iconifyJSONs from "@/generated/iconbundle.json";
import { Icon as IconRaw, type IconifyJSON, addCollection } from "@iconify/react/offline";

for (const json of iconifyJSONs as Array<unknown>) {
  addCollection(json as IconifyJSON);
}

export interface IconProps {
  icon: IconName;
  className?: string;
}

export const Icon: React.FC<IconProps> = (props) => <IconRaw {...props} />;
