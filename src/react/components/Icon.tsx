import { Icon as IconOnline } from "@iconify/react";
import { addCollection, type IconifyJSON, Icon as IconOffline } from "@iconify/react/offline";
import iconifyJSONs from "@/generated/iconbundle.json";
import type { IconName } from "@/types/IconName";

const IconRaw = import.meta.env.PROD ? IconOffline : IconOnline;
if (import.meta.env.PROD) {
  for (const json of iconifyJSONs as Array<unknown>) {
    addCollection(json as IconifyJSON);
  }
}

export interface IconProps {
  icon: IconName;
  className?: string;
}

export const Icon = IconRaw as React.FC<IconProps>;
