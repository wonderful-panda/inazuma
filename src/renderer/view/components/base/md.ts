import { ofType } from "vue-tsx-support";
import Vue from "vue";
import { withclass } from "./withClass";

export const MdButton = ofType<
  {
    href?: string;
    type?: string;
    disabled?: boolean;
    "md-ripple"?: boolean;
  },
  {
    onClick: MouseEvent;
  }
>().convert(Vue.component("MdButton"));

export const MdProgressSpinner = ofType<{
  "md-mode"?: "determinate" | "indeterminate";
  "md-value"?: number;
  "md-diameter"?: number;
  "md-stroke"?: number;
}>().convert(Vue.component("MdProgressSpinner"));

export const MdTooltip = ofType<{
  "md-direction"?: "top" | "right" | "bottom" | "left";
  "md-delay"?: number;
  "md-active"?: boolean;
}>().convert(Vue.component("MdTooltip"));

export const MdSnackbar = ofType<{
  "md-active"?: boolean;
  "md-duration"?: number;
  "md-persistent"?: boolean;
  "md-position"?: "center" | "left";
}>().convert(Vue.component("MdSnackbar"));

export const MdIcon = Vue.component("MdIcon");

export const MdList = Vue.component("MdList");
export const MdDoubleLineList = withclass(MdList)("md-double-line");
export const MdListItem = ofType<{}, { onClick: MouseEvent }>().convert(
  Vue.component("MdListItem")
);
export const MdListItemText = withclass.div("md-list-item-text");

export const MdSubheader = Vue.component("MdSubheader");
export const MdDivider = Vue.component("MdDivider");

export const MdEmptyState = ofType<{
  "md-icon"?: string;
  "md-label"?: string;
  "md-description"?: string;
  "md-rounded"?: boolean;
  "md-size"?: number;
}>().convert(Vue.component("MdEmptyState"));

export const MdField = Vue.component("MdField");

export const MdInput = ofType<
  {
    type?: string;
    value?: string | number;
    placeholder?: string;
    required?: boolean;
    name?: string;
    disabled?: boolean;
    maxlength?: number;
    "md-counter"?: number;
  },
  {
    onInput: string | number;
  }
>().convert(Vue.component("MdInput"));

export const MdMenu = ofType<{
  "md-active": boolean;
  "md-close-on-click"?: boolean;
  "md-close-on-select"?: boolean;
  "md-direction"?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  "md-align-trigger"?: boolean;
  "md-offset-x"?: number;
  "md-offset-y"?: number;
  "md-size"?: "small" | "medium" | "big" | "huge" | "auto";
}>().convert(Vue.component("MdMenu"));

export const MdMenuContent = Vue.component("MdMenuContent");
export const MdMenuItem = ofType<{ disabled?: boolean }, { onClick: MouseEvent }>().convert(
  Vue.component("MdMenuItem")
);
