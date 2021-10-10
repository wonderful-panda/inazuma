import { atom } from "recoil";

export const loading$ = atom({
  key: "misc/loading",
  default: false
});
