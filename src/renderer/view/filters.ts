import Vue from "vue";

export function shortHash(value: string): string {
  return value.slice(0, 8);
}

export default function install() {
  Vue.filter("short-hash", shortHash);
}
