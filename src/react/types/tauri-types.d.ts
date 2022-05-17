import { Ref } from "@/generated/tauri-types";
export * from "@/generated/tauri-types";

export type BranchRef = Extract<Ref, { type: "branch" }>;
export type TagRef = Extract<Ref, { type: "tag" }>;
export type RemoteRef = Extract<Ref, { type: "remote" }>;
