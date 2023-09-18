import { createStore } from "jotai";

const rootStore = createStore();

export type JotaiStore = typeof rootStore;
export const getRootStore = () => rootStore;
