import { CreateElement, VNode } from "vue";
import {
  Mutations,
  Getters,
  Actions,
  Module,
  createMapper
} from "vuex-smart-module";

export interface ButtonOptions {
  name: string;
  text: string;
  primary?: boolean;
  accent?: boolean;
}

export interface DialogOptions {
  title: string;
  renderContent: (h: CreateElement) => string | VNode | VNode[];
  buttons: ButtonOptions[];
}

export type DialogResult =
  | {
      accepted: true;
      buttonId: string;
    }
  | {
      accepted: false;
    };

export class DialogState {
  options?: DialogOptions = undefined;
  resolve?: Resolve<DialogResult> = undefined;
}

class DialogMutations extends Mutations<DialogState> {
  init(payload: { options: DialogOptions; resolve: Resolve<DialogResult> }) {
    const { options, resolve } = payload;
    if (this.state.resolve) {
      this.state.resolve({ accepted: false });
    }
    this.state.options = options;
    this.state.resolve = resolve;
  }

  setResult(ret: DialogResult) {
    if (this.state.resolve) {
      this.state.resolve(ret);
    }
    this.state.options = this.state.resolve = undefined;
  }
}

export class DialogActions extends Actions<
  DialogState,
  Getters<DialogState>,
  DialogMutations
> {
  show({ options }: { options: DialogOptions }): Promise<DialogResult> {
    return new Promise<DialogResult>(resolve => {
      this.mutations.init({ resolve, options });
    });
  }

  accept({ buttonId }: { buttonId: string }) {
    this.mutations.setResult({ accepted: true, buttonId });
  }

  cancel() {
    this.mutations.setResult({ accepted: false });
  }
}

export const dialogModule = new Module({
  state: DialogState,
  mutations: DialogMutations,
  actions: DialogActions
});

export const dialogMapper = createMapper(dialogModule);
