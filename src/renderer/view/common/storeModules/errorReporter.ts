import * as sinai from "sinai";

export interface ErrorLikeObject {
  message: string;
}

export class ErrorReporterState {
  error: ErrorLikeObject | undefined = undefined;
}

export class ErrorReporterMutations extends sinai.Mutations<
  ErrorReporterState
>() {
  setError(error: ErrorLikeObject | undefined) {
    this.state.error = error;
  }
}

export class ErrorReporterGetters extends sinai.Getters<ErrorReporterState>() {}

export class ErrorReporterActions extends sinai.Actions<
  ErrorReporterState,
  ErrorReporterGetters,
  ErrorReporterMutations
>() {
  show(error: ErrorLikeObject) {
    this.mutations.setError(error);
  }

  clear() {
    this.mutations.setError(undefined);
  }
}

export const errorReporterModule = sinai.module({
  state: ErrorReporterState,
  mutations: ErrorReporterMutations,
  getters: ErrorReporterGetters,
  actions: ErrorReporterActions
});
