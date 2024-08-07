// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type TsType =
  | { "kind": "Ignored"; "content": string }
  | { "kind": "Invalid"; "content": string }
  | { "kind": "Void" }
  | { "kind": "String" }
  | { "kind": "Number" }
  | { "kind": "Boolean" }
  | { "kind": "Optional"; "content": TsType }
  | { "kind": "Array"; "content": TsType }
  | { "kind": "Tuple"; "content": Array<TsType> }
  | { "kind": "Record"; "content": { key: TsType; value: TsType } }
  | { "kind": "UserDefined"; "content": string };
