import Vue from "vue";
import * as sinai from "sinai";

export interface ButtonOptions {
    name: string;
    text: string;
    primary?: boolean;
    accent?: boolean;
}

export interface DialogOptions {
    title: string;
    renderContent: (h: Vue.CreateElement) => string | Vue.VNode | Vue.VNode[];
    buttons: ButtonOptions[];
}

export type DialogResult = {
    accepted: true,
    buttonId: string
} | {
    accepted: false
};

export class DialogState {
    options?: DialogOptions = undefined;
    resolve?: Resolve<DialogResult> = undefined;
}

export class DialogMutations extends sinai.Mutations<DialogState>() {
    init(options: DialogOptions, resolve: Resolve<DialogResult>) {
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
        this.state.options = this.state.resolve = null;
    }
}

export class DialogActions extends sinai.Actions<DialogState, any, DialogMutations>() {
    show(options: DialogOptions): Promise<DialogResult> {
        return new Promise<DialogResult>(resolve => {
            this.mutations.init(options, resolve);
        });
    }

    accept(buttonId: string) {
        this.mutations.setResult({ accepted: true, buttonId });
    }

    cancel() {
        this.mutations.setResult({ accepted: false });
    }
}

export const dialogModule = sinai.module({
    state: DialogState,
    mutations: DialogMutations,
    actions: DialogActions
});


