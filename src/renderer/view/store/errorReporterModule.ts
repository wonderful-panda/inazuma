import { ErrorLikeObject } from "view/mainTypes";
import { Mutations, Getters, Actions, Module } from "vuex-smart-module";

export class ErrorReporterState {
  error: ErrorLikeObject | undefined = undefined;
}

export class ErrorReporterMutations extends Mutations<ErrorReporterState> {
  setError(payload: { error: ErrorLikeObject | undefined }) {
    this.state.error = payload.error;
  }
}

export class ErrorReporterGetters extends Getters<ErrorReporterState> {
  get message(): string {
    if (this.state.error) {
      return this.state.error.message;
    } else {
      return "";
    }
  }
}

export class ErrorReporterActions extends Actions<
  ErrorReporterState,
  ErrorReporterGetters,
  ErrorReporterMutations
> {
  show({ error }: { error: ErrorLikeObject }) {
    this.mutations.setError({ error });
  }

  clear() {
    this.mutations.setError({ error: undefined });
  }
}

export const errorReporterModule = new Module({
  state: ErrorReporterState,
  mutations: ErrorReporterMutations,
  getters: ErrorReporterGetters,
  actions: ErrorReporterActions
});
