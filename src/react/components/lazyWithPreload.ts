import { lazy } from "react";

export const lazyWithPreload: typeof lazy = (factory) => {
  const promise = factory();
  return lazy(() => promise);
};
