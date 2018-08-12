import Vue from "vue";
import moment from "moment";

export function shortHash(value: string): string {
  return value.slice(0, 8);
}

export function longDate(value: number | undefined): string {
  if (value === undefined) {
    return "";
  }
  return moment(value)
    .local()
    .format("L LT");
}

export default function install() {
  Vue.filter("short-hash", shortHash);
  Vue.filter("long-date", longDate);
}
