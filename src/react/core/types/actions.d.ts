import type { IconName } from "@/core/types/IconName";

export interface ActionItem {
  id: string;
  label: string;
  icon?: IconName;
  disabled?: boolean;
  handler: () => void;
}

export type IconActionItem = ActionItem & { icon: IconName };

export type Spacer = string & { readonly _Spacer: unique symbol };
