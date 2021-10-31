import { lazy } from "react";

const lazyWithPreload: typeof lazy = (factory) => {
  const promise = factory();
  return lazy(() => promise);
};

export default lazyWithPreload;
