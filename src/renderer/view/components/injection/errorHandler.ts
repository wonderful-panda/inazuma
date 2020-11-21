import { InjectionKey, inject, provide } from "@vue/composition-api";
import { ErrorLikeObject } from "view/mainTypes";

export type ErrorHandler = {
  handleError: (payload: { error: ErrorLikeObject }) => void;
};

const nope: ErrorHandler = {
  handleError: () => {}
};

const key: InjectionKey<ErrorHandler> = Symbol("inazuma.vue.injection.ErrorHandler");

export function injectErrorHandler(): ErrorHandler {
  return inject(key) || nope;
}

export function provideErrorHandler(value: ErrorHandler): void {
  provide(key, value);
}
