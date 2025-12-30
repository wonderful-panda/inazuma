import { Icon as IconOnline } from "@iconify/react";
import { addCollection, type IconifyJSON, Icon as IconOffline } from "@iconify/react/offline";
import type { IconName } from "@/core/types/IconName";
import iconifyJSONs from "@/generated/iconbundle.json";

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
